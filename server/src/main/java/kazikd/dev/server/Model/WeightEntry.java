package kazikd.dev.server.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "weight_entries")
@Data
public class WeightEntry {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private double weight;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
