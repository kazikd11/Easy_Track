package kazikd.dev.server.unit;

import kazikd.dev.server.Model.User;
import kazikd.dev.server.Repository.UserRepo;
import kazikd.dev.server.Service.MyUserDetailsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MyUserDetailsServiceTest {

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private MyUserDetailsService myUserDetailsService;

    private final String dummyEmail = "email@email.com";
    private final User dummyUser = new User(dummyEmail, "password");

    @Test
    void loadUserByUsername_found() {
        when(userRepo.findByEmail(dummyEmail)).thenReturn(dummyUser);
        UserDetails result = myUserDetailsService.loadUserByUsername(dummyEmail);
        assertNotNull(result);
        assertEquals(dummyUser.getEmail(), result.getUsername());
        assertEquals(dummyUser.getPassword(), result.getPassword());
        verify(userRepo).findByEmail(dummyEmail);
    }

    @Test
    void loadUserByUsername_notFound() {
        when(userRepo.findByEmail(dummyEmail)).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () ->
                myUserDetailsService.loadUserByUsername(dummyEmail)
        );
        verify(userRepo).findByEmail(dummyEmail);
    }
}