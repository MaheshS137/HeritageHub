package com.heritagehub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "security_credentials")
public class SecurityCredential {

    @Id
    @Column(name = "account_id")
    private String accountId;

    @Column(nullable = false, length = 500)
    private String question;

    @Column(name = "answer_hash", nullable = false)
    private String answerHash;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;

    @Column(name = "locked_until")
    private String lockedUntil;

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswerHash() { return answerHash; }
    public void setAnswerHash(String answerHash) { this.answerHash = answerHash; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public String getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(String lockedUntil) { this.lockedUntil = lockedUntil; }
}
