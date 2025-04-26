package kazikd.dev.server.Service;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Repository.SyncRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SyncService {

    private final SyncRepo syncRepo;
    private final UserService userService;

    public SyncService(SyncRepo syncRepo, UserService userService) {
        this.syncRepo = syncRepo;
        this.userService = userService;
    }

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

    public void deleteAllUserEntries() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        syncRepo.deleteByUser(currentUser);
    }

    @Transactional
    protected void syncEntries(List<WeightEntry> weightEntries, User currentUser){
        List<WeightEntry> existingEntries = syncRepo.findByUser(currentUser);

        Map<Long, WeightEntry> existingEntriesMap = existingEntries.stream()
                .collect(Collectors.toMap(WeightEntry::getId, entry -> entry));
    }


}

