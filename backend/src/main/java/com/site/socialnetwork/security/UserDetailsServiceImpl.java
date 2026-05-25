package com.site.socialnetwork.security;


import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));

        System.out.println("Пользователь: " + username + ", isActive: " + user.isActive());

        if (!user.isActive()) {
            System.out.println("Бросаем DisabledException");
            throw new DisabledException("Ваш аккаунт заблокирован. Обратитесь к администратору.");
        }

        return UserDetailsImpl.build(user);
    }
}
