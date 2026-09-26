import { adminSetUserRole, adminDeletePoll } from '../actions';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/app/actions/user';

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    poll: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/app/actions/user', () => ({
  getAuthenticatedUser: jest.fn(),
  writeAuditLog: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Admin Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adminSetUserRole', () => {
    it('rejects unauthenticated users', async () => {
      (getAuthenticatedUser as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
      const result = await adminSetUserRole('target-user', 'MODERATOR');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('rejects non-admin users', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'USER' });
      const result = await adminSetUserRole('target-user', 'MODERATOR');
      expect(result).toEqual({ success: false, error: 'Only admins can change roles.' });
    });

    it('rejects changing own role', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      const result = await adminSetUserRole('admin-1', 'USER');
      expect(result).toEqual({ success: false, error: 'You cannot change your own role.' });
    });

    it('allows admin to change user role', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
      (db.user.update as jest.Mock).mockResolvedValue({ id: 'target-user', role: 'MODERATOR' });
      
      const result = await adminSetUserRole('target-user', 'MODERATOR');
      expect(result).toEqual({ success: true });
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'target-user' },
        data: { role: 'MODERATOR' },
      });
    });
  });

  describe('adminDeletePoll', () => {
    it('rejects non-staff users', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'USER' });
      const result = await adminDeletePoll('poll-1');
      expect(result).toEqual({ success: false, error: 'Admin access required.' });
    });

    it('allows moderator to soft-delete poll', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'mod-1', role: 'MODERATOR' });
      (db.poll.update as jest.Mock).mockResolvedValue({ id: 'poll-1' });

      const result = await adminDeletePoll('poll-1');
      expect(result).toEqual({ success: true });
      expect(db.poll.update).toHaveBeenCalledWith({
        where: { id: 'poll-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
