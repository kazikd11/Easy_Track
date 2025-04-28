package kazikd.dev.server.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true)
    private String email;

    private String password;

    private String refreshToken;
    private LocalDateTime refreshTokenExpiry;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeightEntry> weightEntries = new ArrayList<>();

    public User(String email, String defaultPassword) {
        this.email = email;
        this.password = defaultPassword;
    }

    public boolean isRefreshTokenExpired() {
        return refreshTokenExpiry == null || refreshTokenExpiry.isBefore(LocalDateTime.now()) || refreshToken == null;
    }
}
