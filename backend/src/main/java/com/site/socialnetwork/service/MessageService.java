package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.MessageDTO;
import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.Message;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.MessageRepository;
import com.site.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // Отправить сообщение
    public MessageDTO sendMessage(Long receiverId, String content, User sender) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);

        return convertToDTO(messageRepository.save(message));
    }

    // История чата с пользователем
    public List<MessageDTO> getChatHistory(Long userId, User currentUser) {
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return messageRepository
                .findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
                        currentUser, otherUser, currentUser, otherUser)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Список чатов
    public List<UserDTO> getChatList(User user) {
        return messageRepository.findChatPartners(user)
                .stream()
                .map(u -> new UserDTO(
                        u.getId(), u.getUsername(), u.getEmail(),
                        u.getFirstName(), u.getLastName(),
                        u.getAvatar(), u.getBio(),
                        u.getRole().name(), u.getCreatedAt(), u.isActive()
                ))
                .collect(Collectors.toList());
    }

    // Конвертация
    private MessageDTO convertToDTO(Message message) {
        return new MessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getSender().getAvatar(),
                message.getReceiver().getId(),
                message.getContent(),
                message.getTimestamp(),
                message.isRead()
        );
    }
    public long getUnreadCount(User currentUser, User otherUser) {
        return messageRepository.countBySenderAndReceiverAndIsReadFalse(otherUser, currentUser);
    }

    public void markAsRead(User currentUser, User otherUser) {
        List<Message> unreadMessages = messageRepository.findBySenderAndReceiverAndIsReadFalse(otherUser, currentUser);
        for (Message msg : unreadMessages) {
            msg.setRead(true);
        }
        messageRepository.saveAll(unreadMessages);
    }
}
