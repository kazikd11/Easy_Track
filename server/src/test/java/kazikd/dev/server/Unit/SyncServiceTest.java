package kazikd.dev.server.Unit;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Repository.SyncRepo;
import kazikd.dev.server.Service.SyncService;
import kazikd.dev.server.Service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SyncServiceTest {

    @Mock
    private SyncRepo syncRepo;

    @Mock
    private UserService userService;

    @InjectMocks
    private SyncService syncService;

    private final User dummyUser = new User();

    @BeforeEach
    void setUp() {
        when(userService.getCurrentAuthenticatedUser()).thenReturn(dummyUser);
    }

    @Test
    void syncToCloud_whenAllTransactions_shouldSaveAndDeleteCorrectly() {
        List<WeightEntryDTO> incoming = List.of(
                new WeightEntryDTO(LocalDate.of(2025, 1, 1), 70.0),
                new WeightEntryDTO(LocalDate.of(2025, 1, 2), 72.0)
        );

        WeightEntry existingSameDate = new WeightEntry(LocalDate.of(2025, 1, 2), 71.0, dummyUser);
        WeightEntry toBeDeleted = new WeightEntry(LocalDate.of(2025, 1, 3), 69.0, dummyUser);
        List<WeightEntry> existingEntries = List.of(existingSameDate, toBeDeleted);
        when(syncRepo.findByUser(dummyUser)).thenReturn(existingEntries);

        syncService.syncToCloud(incoming);

        verify(syncRepo).save(new WeightEntry(LocalDate.of(2025, 1, 1), 70.0, dummyUser));
        verify(syncRepo).save(new WeightEntry(LocalDate.of(2025, 1, 2), 72.0, dummyUser));
        verify(syncRepo).delete(new WeightEntry(LocalDate.of(2025, 1, 3), 69.0, dummyUser));
    }

    @Test
    void syncToCloud_whenNoChanges_shouldNotSaveOrDelete() {
        List<WeightEntryDTO> input = List.of(
                new WeightEntryDTO(LocalDate.of(2025, 1, 1), 70.0),
                new WeightEntryDTO(LocalDate.of(2025, 1, 2), 71.0)
        );

        List<WeightEntry> existing = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 70.0, dummyUser),
                new WeightEntry(LocalDate.of(2025, 1, 2), 71.0, dummyUser)
        );

        when(syncRepo.findByUser(dummyUser)).thenReturn(existing);

        syncService.syncToCloud(input);

        verify(syncRepo, never()).save(any());
        verify(syncRepo, never()).delete(any());
    }

    @Test
    void syncToCloud_whenEmptyList_shouldDeleteAllExistingEntries() {
        List<WeightEntry> existing = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 70.0, dummyUser),
                new WeightEntry(LocalDate.of(2025, 1, 2), 71.0, dummyUser)
        );

        when(syncRepo.findByUser(dummyUser)).thenReturn(existing);

        syncService.syncToCloud(List.of());

        verify(syncRepo).delete(existing.get(0));
        verify(syncRepo).delete(existing.get(1));
        verify(syncRepo, never()).save(any());
    }

    @Test
    void syncToCloud_whenNullInput_shouldThrowNullPointerException() {
        assertThrows(NullPointerException.class, () -> syncService.syncToCloud(null));
    }

    @Test
    void syncFromCloud_whenCalled_shouldReturnAllUserEntries() {
        List<WeightEntry> existing = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 70.0, dummyUser),
                new WeightEntry(LocalDate.of(2025, 1, 2), 71.0, dummyUser)
        );

        when(syncRepo.findByUser(dummyUser)).thenReturn(existing);

        List<WeightEntryDTO> result = syncService.syncFromCloud();

        assertEquals(2, result.size());
        assertEquals(existing.get(0).getDate(), result.get(0).getDate());
        assertEquals(existing.get(0).getWeight(), result.get(0).getWeight());
        assertEquals(existing.get(1).getDate(), result.get(1).getDate());
        assertEquals(existing.get(1).getWeight(), result.get(1).getWeight());
    }

    @Test
    void deleteAllUserEntries_whenCalled_shouldDeleteAllEntriesForUser() {
        syncService.deleteAllUserEntries();
        verify(syncRepo).deleteByUser(dummyUser);
    }


}