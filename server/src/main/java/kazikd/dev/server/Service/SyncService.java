package kazikd.dev.server.Service;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Repository.SyncRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SyncService {

    private final SyncRepo syncRepo;
    private final UserService userService;

    public SyncService(SyncRepo syncRepo, UserService userService) {
        this.syncRepo = syncRepo;
        this.userService = userService;
    }

    @Transactional
    public void syncToCloud(List<WeightEntryDTO> weightEntriesDTO) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        List<WeightEntry> weightEntries = weightEntriesDTO.stream()
                .map(dto -> new WeightEntry(dto.getDate(), dto.getWeight(), currentUser))
                .toList();

        syncEntries(weightEntries, currentUser);
    }


    public List<WeightEntryDTO> syncFromCloud() {
        User currentUser = userService.getCurrentAuthenticatedUser();

        List<WeightEntry> weightEntries = syncRepo.findByUser(currentUser);

        return weightEntries.stream()
                .map(entry -> new WeightEntryDTO(entry.getDate(), entry.getWeight()))
                .toList();
    }

    @Transactional
    public void deleteAllUserEntries() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        syncRepo.deleteByUser(currentUser);
    }

    private void syncEntries(List<WeightEntry> incomingEntries, User currentUser) {
        Map<LocalDate, WeightEntry> existingEntriesMap = syncRepo.findByUser(currentUser).stream()
                .collect(Collectors.toMap(WeightEntry::getDate, entry -> entry));

        Set<LocalDate> incomingDates = incomingEntries.stream()
                .map(WeightEntry::getDate)
                .collect(Collectors.toSet());

        for (WeightEntry entry : incomingEntries) {
            WeightEntry existingEntry = existingEntriesMap.get(entry.getDate());
            if (existingEntry == null) {
                syncRepo.save(entry);
            } else {
                existingEntry.setWeight(entry.getWeight());
                syncRepo.save(existingEntry);
            }
        }

        for (WeightEntry entry : existingEntriesMap.values()) {
            if (!incomingDates.contains(entry.getDate())) {
                syncRepo.delete(entry);
            }
        }
    }

}

