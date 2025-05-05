package kazikd.dev.server.Controller;

import kazikd.dev.server.Model.MessageResponse;
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
    public ResponseEntity<MessageResponse> syncToCloud(@RequestBody List<WeightEntryDTO> weightEntries) {
        syncService.syncToCloud(weightEntries);
        return ResponseEntity.ok(new MessageResponse("Data synced to cloud"));
    }

    @GetMapping()
    public List<WeightEntryDTO> syncFromCloud() {
        return syncService.syncFromCloud();
    }

    @DeleteMapping()
    public ResponseEntity<MessageResponse> deleteAllUserEntries() {
        syncService.deleteAllUserEntries();
        return ResponseEntity.ok(new MessageResponse("All user entries deleted"));
    }
}