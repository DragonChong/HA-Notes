# ECPath5

![Untitled diagram-2025-10-13-080530.png](ECPath5.assets/Untitled%20diagram-2025-10-13-080530.png)

```bash
flowchart TD
 subgraph Backend["Backend"]
        EJB["[EJB] <br> e.g. RequestAppServiceBean#gcrSpecAckRegister"]
        AppService["[Implentation] <br> e.g. GcrSpecAckAppServiceImpl"]
        Service["[Service] <br> e.g. RequestService"]
        Dao["[DAO] <br> e.g. RequestDaoJpaImpl"]
        Entity["[Entity] <br> e.g. Request"]
  end
 subgraph Frontend["Frontend"]
        UI["[UI] <br> e.g. GcrSpecAck.mxml"]
        ScreenCom["[Screen or Component] <br> e.g. SpecimenNoTextInputPm, GcrSpecAckPm"]
        Event["[Event] <br> e.g. GcrSpecAckEvent"]
        Listener["[Listener] <br> e.g. GcrSpecAckCommand#register"]
  end
    EJB --> AppService & Listener
    AppService --> Service
    Service --> Dao
    Dao --> Entity
    UI --- ScreenCom
    ScreenCom -- dispatch --> Event
    Event -- handled by --> Listener
    Listener --> EJB

```