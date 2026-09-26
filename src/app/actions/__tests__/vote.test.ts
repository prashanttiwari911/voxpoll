import { submitVote } from '../vote';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '../user';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    poll: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    vote: {
      createMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../user', () => ({
  getAuthenticatedUser: jest.fn(),
  createNotification: jest.fn(),
  writeAuditLog: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('submitVote Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: 'user-123', age: 25, address: 'Maharashtra' };

  it('rejects unauthenticated users', async () => {
    (getAuthenticatedUser as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('rejects duplicate optionIds (validation layer)', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    const result = await submitVote('poll-1', ['opt-1', 'opt-1']);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/same option multiple times/i);
  });

  it('rejects if poll does not exist', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, error: 'Poll not found.' });
  });

  it('rejects if poll is DRAFT', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({ status: 'DRAFT' });
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, error: 'This poll is not yet published.' });
  });

  it('rejects if poll has expired (closesAt in the past)', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      closesAt: new Date(Date.now() - 10000), // Past
    });
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, error: 'This poll has expired.' });
  });

  it('rejects if user has already voted', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      closesAt: new Date(Date.now() + 10000), // Future
      votes: [{ id: 'vote-1' }], // Already voted
    });
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, error: 'You have already voted in this poll!' });
  });

  it('rejects if user has incomplete profile', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user-123', age: null });
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      closesAt: new Date(Date.now() + 10000),
      votes: [], // Not voted
      options: [{ id: 'opt-1' }],
    });
    const result = await submitVote('poll-1', ['opt-1']);
    expect(result).toEqual({ success: false, redirectProfile: true, error: 'Please complete your profile (add age & address) before voting so we can analyze demographics!' });
  });

  it('rejects multiple options on single-choice poll', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      votes: [],
      options: [{ id: 'opt-1' }, { id: 'opt-2' }],
      isMultipleChoice: false,
      maxChoices: 1,
    });
    const result = await submitVote('poll-1', ['opt-1', 'opt-2']);
    expect(result).toEqual({ success: false, error: 'This poll only allows one choice.' });
  });

  it('rejects exceeding maxChoices on multi-choice poll', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      votes: [],
      options: [{ id: 'opt-1' }, { id: 'opt-2' }, { id: 'opt-3' }],
      isMultipleChoice: true,
      maxChoices: 2,
    });
    const result = await submitVote('poll-1', ['opt-1', 'opt-2', 'opt-3']);
    expect(result).toEqual({ success: false, error: 'You may select at most 2 options in this poll.' });
  });

  it('rejects invalid option IDs', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      status: 'PUBLISHED',
      votes: [],
      options: [{ id: 'opt-1' }],
      isMultipleChoice: false,
    });
    const result = await submitVote('poll-1', ['opt-999']);
    expect(result).toEqual({ success: false, error: 'Invalid option selected.' });
  });

  it('accepts valid single-choice vote', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    (db.poll.findUnique as jest.Mock).mockResolvedValue({
      id: 'poll-1',
      question: 'Sample poll question?',
      status: 'PUBLISHED',
      votes: [],
      options: [{ id: 'opt-1' }],
      isMultipleChoice: false,
      creator: { id: 'creator-1' }
    });
    (db.vote.count as jest.Mock).mockResolvedValue(0); // Mock rate limit count
    (db.vote.createMany as jest.Mock).mockResolvedValue({ count: 1 });

    const result = await submitVote('poll-1', ['opt-1']);
    
    expect(result).toEqual({ success: true, message: 'Vote cast successfully! Thank you for voting. 🗳️' });
    expect(db.vote.createMany).toHaveBeenCalledWith({
      data: [{ pollId: 'poll-1', optionId: 'opt-1', userId: 'user-123' }]
    });
  });
});
