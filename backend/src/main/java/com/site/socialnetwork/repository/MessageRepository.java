package com.site.socialnetwork.repository;

import com.site.socialnetwork.entity.Message;
import com.site.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // История сообщений между двумя пользователями (по порядку)
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            User sender1, User receiver1, User sender2, User receiver2);

    // Список чатов (с кем общался пользователь)
    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver = :user " +
            "UNION " +
            "SELECT DISTINCT m.receiver FROM Message m WHERE m.sender = :user")
    List<User> findChatPartners(@Param("user") User user);

    // Непрочитанные сообщения от конкретного пользователя
    long countBySenderAndReceiverAndIsReadFalse(User sender, User receiver);
    void deleteAllBySenderOrReceiver(User sender, User receiver);
    List<Message> findBySenderAndReceiverAndIsReadFalse(User sender, User receiver);
}
