import { render, fireEvent, waitFor } from '@testing-library/react';
import { TaskManagement } from '../../components/TaskManagement';
import TaskService from '../../services/TaskService';
import { AuthProvider } from '../../providers/AuthProvider';
import { TranslationProvider } from '../../providers/TranslationProvider';

jest.mock('../../services/TaskService');

describe('Task Management Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and display a new task', async () => {
    const mockTask = {
      id: 1,
      title: 'New Task',
      description: 'Task Description',
      status: 'pending'
    };

    TaskService.createTask.mockResolvedValueOnce(mockTask);
    TaskService.getTasks.mockResolvedValueOnce([mockTask]);

    const { getByText, getByLabelText } = render(
      <AuthProvider>
        <TranslationProvider>
          <TaskManagement />
        </TranslationProvider>
      </AuthProvider>
    );

    // Öppna formuläret
    fireEvent.click(getByText('Ny uppgift'));

    // Fyll i formuläret
    fireEvent.change(getByLabelText('Titel'), {
      target: { value: 'New Task' }
    });
    fireEvent.change(getByLabelText('Beskrivning'), {
      target: { value: 'Task Description' }
    });

    // Skicka formuläret
    fireEvent.click(getByText('Spara'));

    // Verifiera att uppgiften skapades och visas
    await waitFor(() => {
      expect(getByText('New Task')).toBeInTheDocument();
      expect(getByText('Task Description')).toBeInTheDocument();
    });
  });

  // Fler tester...
}); 