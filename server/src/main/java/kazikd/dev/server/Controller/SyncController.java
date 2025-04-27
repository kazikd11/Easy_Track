package kazikd.dev.server.Controller;

import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Service.SyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sync")
public class SyncController {
    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping()
    public ResponseEntity<String> syncToCloud(@RequestBody List<WeightEntryDTO> weightEntries) {
        syncService.syncToCloud(weightEntries);
        return ResponseEntity.ok("Data synced to cloud");
    }

    @GetMapping()
    public List<WeightEntryDTO> syncFromCloud() {
        return syncService.syncFromCloud();
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteAllUserEntries() {
        syncService.deleteAllUserEntries();
        return ResponseEntity.ok("All user entries deleted");
    }
}