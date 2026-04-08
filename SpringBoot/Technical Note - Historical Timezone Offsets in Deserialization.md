Here is the documentation for the specific 1963 historical dates and a visual explanation of why that 1-hour "jump" occurs during deserialization.

## Scenario

When deserializing a JSON string containing the date `1963-10-11T00:00:00.000` using an `ObjectMapper` configured with the **Asia/Hong_Kong** timezone, the resulting `java.sql.Timestamp` appears as `1963-10-10 23:00:00.0`.

## Root Cause: Hong Kong "Summer Time" (1963)

The discrepancy is caused by the **Daylight Saving Time (DST)** rules, historically referred to as "Summer Time" in Hong Kong, stored in the IANA Time Zone Database (TZDB).

### 1. The 1963 Timeline

In 1963, Hong Kong observed an extended period of Summer Time to conserve resources. According to the Hong Kong Observatory:

- **Start:** March 24, 1963 (Clocks turned forward to GMT+9)
    
- **End:** November 3, 1963 (Clocks turned back to GMT+8)
    

Because the date in question (**October 11**) falls within this window, the system treats the input as **GMT+9**.

### 2. The Conversion Logic

When the `ObjectMapper` processes a "naked" timestamp (no offset) while set to `Asia/Hong_Kong`, it performs the following calculation:

1. **Input:** `1963-10-11T00:00:00.000`
    
2. **Contextual Offset:** The TZDB identifies this date was **GMT+9**.
    
3. **Standardized Instant:** The time is stored internally as `1963-10-10T15:00:00.000Z` (UTC).
    
4. **Display/Output:** When `java.sql.Timestamp` or a logger prints this value in a modern **GMT+8** context, it subtracts 1 hour from the "wall clock" time to match the standard offset, resulting in `23:00:00` on the previous day.
    

## Impacted Components

|**Component**|**Behavior**|
|---|---|
|**Jackson ObjectMapper**|Interprets "naked" strings using historical regional offsets (GMT+9 for Oct 1963).|
|**JVM TZDB**|The internal database containing Hong Kong's 1941–1979 Summer Time records.|
|**java.sql.Timestamp**|A legacy wrapper around UTC milliseconds; highly sensitive to the JVM default timezone during formatting.|

## Recommended Solutions

### Solution A: Use UTC for Data Processing (Best Practice)

Standardize the `ObjectMapper` to UTC to avoid regional historical anomalies.

Java

```
mapper.setTimeZone(TimeZone.getTimeZone("UTC"));
```

### Solution B: Use `LocalDateTime`

If the exact "wall clock" time (midnight) must be preserved regardless of geographical history, use the `java.time.LocalDateTime` class, which does not carry offset information.

Java

```
public class MyEntity {
    public LocalDateTime eventTime; // Remains 00:00:00
}
```

### Solution C: Disable Context Adjustment

Prevent Jackson from recalculating the instant based on the Mapper's specific timezone context.

Java

```
mapper.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE);
```

## Summary

The 1-hour difference is **not a software bug**, but a historically accurate representation of time. Because Hong Kong was one hour ahead of its current standard in October 1963, a timestamp at midnight in "Summer Time" is technically one hour earlier when viewed through the lens of "Standard Time."