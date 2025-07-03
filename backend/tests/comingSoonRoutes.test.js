const { createComingSoon } = require('../controllers/comingSoonController');

// Mock the Mongoose model
jest.mock('../models/ComingSoon', () => {
  const mockSave = jest.fn().mockResolvedValue(true);
  const mockComingSoon = jest.fn((data) => ({
    ...data,
    _id: 'mockId',
    save: mockSave,
  }));
  return mockComingSoon;
});

const ComingSoon = require('../models/ComingSoon'); // Import after mocking

describe('Coming Soon Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComingSoon', () => {
    it('should create a new coming soon entry', async () => {
      const req = {
        body: {
          title: 'New Coming Soon Item',
          description: 'This is a test coming soon item.',
          launchDate: new Date(),
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await createComingSoon(req, res, next);

      expect(ComingSoon).toHaveBeenCalledTimes(1); // Expect the constructor to be called
      expect(ComingSoon).toHaveBeenCalledWith(req.body); // Expect the constructor to be called with the correct data
      expect(ComingSoon().save).toHaveBeenCalledTimes(1); // Expect save to be called on the instance
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Coming Soon Item',
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});