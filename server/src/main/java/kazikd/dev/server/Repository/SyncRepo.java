package kazikd.dev.server.Repository;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyncRepo extends JpaRepository<WeightEntry, Long> {
    List<WeightEntry> findByUser(User user);
    void deleteByUser(User user);
}
