# Logging

## HikariPool

```bash
logging:
  level:
    com:
      zaxxer:
        hikari:
          pool:
            HikariPool: DEBUG  # Or TRACE for more details
```

## data-source

```bash
logging:
  level:
    root: INFO
    hk.org.ha.lis.config: DEBUG
```