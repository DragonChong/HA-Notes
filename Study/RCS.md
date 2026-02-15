# RCS

## Main Flow

### 1. **Receiving a Request**

- The main entry point for handling a request is the function `port_int(sock_no, in_packet)` found in several modules (e.g., `lisg_prcs.c`, `lisg_rcs.c`, `rcw_work.c`).
- The `in_packet` parameter is a pointer to a `UNIX_packet` structure, which represents the incoming request. (The exact definition of `UNIX_packet` is not found in the headers you provided, but it is consistently used as the request container.)

---

### 2. **Processing the Request**

- In the server modules (`lisg_prcs.c`, `lisg_rcs.c`), `port_int` checks the action type in the packet:

```other
if (in_packet->action == ACT_RCS_SLEEP)
    sleep(3);
act_apps_dispatch(in_packet);
```

    - If the action is `ACT_RCS_SLEEP`, it sleeps for 3 seconds.
    - Otherwise, it calls `act_apps_dispatch(in_packet)` to dispatch the request for further processing.
- In the worker module (`rcw_work.c`), `port_int` uses a mutex for thread safety and then calls:

```other
act_rcs_send(in_packet);
```

    - This function either sends a token to an external service or processes the request locally via `rcw_process` and `rgc_process`.

---

### 3. **Dispatching the Request**

- The function `act_apps_dispatch` is called to handle the main dispatch logic. However, its definition is not found in the code or headers directly available. It may be defined via a macro, function pointer, or in a different file not yet identified.
- The dispatch function is responsible for routing the request to the appropriate handler based on the action or type of the packet.

---

### 4. **Further Processing**

- In the worker, `act_rcs_send` checks if the request should be sent to an external service (using `sendeaptoken`) or processed locally.
- Local processing is done by calling `rcw_process` and `rgc_process`, which likely handle specific types of requests or business logic.

---

### 5. **Summary Flow**

```other
flowchart TD
    A["Incoming Request (UNIX_packet)"] --> B["port_int()"]
    B -->|If ACT_RCS_SLEEP| C["Sleep 3s"]
    B -->|Else| D["act_apps_dispatch() or act_rcs_send()"]
    D --> E["Dispatch/Process Request"]
    E --> F["(Optional) External Service or Local Processing"]
```

---

### **Key Points**

- **port_int** is the main entry for request handling.
- **act_apps_dispatch** (in servers) and **act_rcs_send** (in workers) are the main dispatch/process functions.
- The actual business logic is likely implemented in the functions called by these dispatchers, such as `rcw_process`, `rgc_process`, etc.

