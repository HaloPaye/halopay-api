import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../src/middleware/error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('handles AppError correctly', () => {
    const error = new AppError(400, 'BAD_REQUEST', 'Invalid data', { field: 'name' });
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Invalid data',
        details: { field: 'name' },
      })
    }));
  });

  it('handles MulterError correctly', () => {
    const error = new Error('File too large');
    error.name = 'MulterError';
    
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'FILE_UPLOAD_ERROR',
        message: 'File too large'
      })
    }));
  });

  it('handles generic unhandled errors as 500', () => {
    // Silence console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const error = new Error('Unknown catastrophic failure');
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred'
      })
    }));
    
    consoleSpy.mockRestore();
  });
});
