package kazikd.dev.server.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class WeightEntryDTO {
    private LocalDate date;
    private double weight;

}
