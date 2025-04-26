package kazikd.dev.server.Controller;

import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Service.SyncService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync-entries")
    public String syncToCloud(@RequestBody List<WeightEntryDTO> weightEntries) {
        syncService.syncToCloud(weightEntries);
        return "Data synced to cloud";
    }

    @GetMapping("/sync-entries")
    public String syncFromCloud() {
        List<WeightEntryDTO> weightEntries = syncService.syncFromCloud();
        return "Data synced from cloud";
    }

    @DeleteMapping("/sync-entries")
    public String deleteAllUserEntries() {
        syncService.deleteAllUserEntries();
        return "All user entries deleted";
    }
}