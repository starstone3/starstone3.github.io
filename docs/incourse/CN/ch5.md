---
comments : true
---

# 运输层
> 运输层的作用是实现进程之间的可靠传输

总的来说,这一层的协议主要有两个,TCP与UDP.

-   **UDP (用户数据报协议)**: 无连接, 尽最大努力交付, 面向报文. 适用于对实时性要求高、对丢包不敏感的应用(如视频会议).

-   **TCP (传输控制协议)**: 面向连接, 提供可靠交付, 面向字节流. 适用于要求数据准确无误的应用(如文件传输、邮件).

不同操作系统上,进程标识符的格式是不一样的.为了解决这个问题,运输层使用了端口号,来统一标识进程.

## 端口号

端口号是一个16位的整数, 范围是 0 ~ 65535. 它用于在主机中唯一标识一个应用进程.

端口号只具有本地意义, 即端口号只是为了标志本计算机应用层中的各进程. 在因特网中不同计算机的相同端口号是没有联系的.

### 端口号的分类

端口号分为以下三类:

1.  **熟知端口号 (Well-known Ports)**:

    -   范围: **0 ~ 1023**
    -   由 IANA (互联网号码分配机构) 指派给 TCP/IP 最重要的一些应用程序.
    -   例如: FTP (21), SSH (22), Telnet (23), SMTP (25), DNS (53), HTTP (80), HTTPS (443).

2.  **登记端口号 (Registered Ports)**:

    -   范围: **1024 ~ 49151**
    -   为没有熟知端口号的应用程序使用. 使用这类端口号必须在 IANA 登记, 以防止重复.
    -   例如: MySQL (3306), Redis (6379), Tomcat (8080).

3.  **客户端口号 (Ephemeral Ports / Dynamic Ports)**:

    -   范围: **49152 ~ 65535**
    -   仅在客户进程运行时才动态选择, 因此又称为短暂端口号.
    -   当服务器进程收到客户进程的报文时, 就知道了客户进程所使用的端口号, 因而可以把数据发送给客户进程. 通信结束后, 该端口号可供其他客户进程以后使用.

??? example "访问网站的全过程"

    ```mermaid
    sequenceDiagram
        participant User as 用户主机
        participant DNS as 本地DNS服务器
        participant Web as 网站服务器

        Note over User: 1. 用户在浏览器输入 www.example.com

        %% DNS 解析过程 (UDP)
        rect rgb(240, 248, 255)
        Note right of User: DNS解析阶段 (通常使用UDP 53端口)
        User->>User: 检查本地hosts和缓存
        User->>DNS: 发送DNS查询请求 (UDP)
        Note right of User: 源端口:随机, 目的端口:53
        DNS->>DNS: 递归查询 (Root -> TLD -> Authoritative)
        DNS-->>User: 返回IP地址 (例如 1.2.3.4)
        end

        %% HTTP 请求过程 (TCP)
        rect rgb(255, 250, 240)
        Note right of User: HTTP请求阶段 (使用TCP 80/443端口)
        
        %% TCP 三次握手
        User->>Web: SYN (建立连接请求)
        Note right of User: 源端口:随机, 目的端口:80
        Web-->>User: SYN + ACK (确认并同意)
        User->>Web: ACK (确认)
        Note over User, Web: TCP连接建立完成 (三次握手)

        %% 数据传输
        User->>Web: HTTP GET 请求
        Web-->>User: HTTP 响应 (网页内容)

        %% TCP 四次挥手 (简化)
        User->>Web: FIN (断开连接请求)
        Web-->>User: ACK
        Web-->>User: FIN
        User->>Web: ACK
        Note over User, Web: TCP连接释放 (四次挥手)
        end
    ```


## TCP

### TCP的首部格式

<div style="text-align: center;">
    <img src="../../../image/mac212.png" width="50%">
    <br>
    <caption>TCP首部格式</caption>
</div>



1.  **源端口 (Source Port)**: 16位。发送方的端口号。

2.  **目的端口 (Destination Port)**: 16位。接收方的端口号。

3.  **序号 (Sequence Number)**: 32位。本报文段所发送数据的第一个字节的序号。在建立连接时，SYN报文段会携带一个初始序号。

4.  **确认号 (Acknowledgment Number)**: 32位。期望收到对方下一个报文段的第一个字节的序号。若确认号为N，则表示N-1及以前的数据都已正确收到。

5.  **数据偏移 (Data Offset)**: 4位。表示TCP报文段的数据部分的起始位置距离TCP报文段的起始位置有多远，即TCP首部长度。单位是4字节（32位字）。因此，TCP首部最大长度为 (2^4 - 1) * 4 = 15 * 4 = 60字节。

6.  **保留 (Reserved)**: 6位。保留为今后使用，目前必须置为0。

7.  **标志位 (Flags)**: 6位。

    *   **URG (Urgent)**: 紧急指针有效。
    *   **ACK (Acknowledgment)**: 确认号有效。
    *   **PSH (Push)**: 立即发送数据。
    *   **RST (Reset)**: 重置连接。
    *   **SYN (Synchronize)**: 同步序号，用于建立连接。
    *   **FIN (Finish)**: 终止发送方数据，用于释放连接。

8.  **窗口大小 (Window Size)**: 16位。接收方告知发送方自己还能接收多少字节的数据，用于流量控制。

9.  **校验和 (Checksum)**: 16位。对整个TCP报文段（包括首部和数据）进行校验，由发送方计算，接收方验证。

10. **紧急指针 (Urgent Pointer)**: 16位。当URG标志位为1时有效，指出紧急数据在当前报文段中的偏移量。

11. **选项 (Options)**: 长度可变，最长40字节。例如，最大报文段长度（MSS）、窗口扩大因子、时间戳等。

12. **填充 (Padding)**: 长度可变。用于确保TCP首部长度是4字节的整数倍。
