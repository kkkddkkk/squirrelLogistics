package com.gpt.squirrelLogistics.repository.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.notification.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

}
