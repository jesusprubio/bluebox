# Bluebox

**work in progress**

A collection of exploits for different VoIP products. Thanks to the
[Go Exploit Framework](https://github.com/vulncheck-oss/go-exploit).

If you ended up here looking for a VoIP pentesting solution, check out
[Sippts](https://github.com/Pepelux/sippts) (`sippts-gui` in Kali) or
[SIPVicious](https://github.com/EnableSecurity/sipvicious). This project is
more focused on the exploitation phase.

## Install

```sh
git clone https://github.com/jesusprubio/bluebox.git
cd bluebox
go mod tidy
go mod vendor
```

## Usage

We follow the [Go Exploit Framework](https://github.com/vulncheck-oss/go-exploit/blob/main/docs/usage-example.md)
recommended patterns. For convenience, the binaries are not included in this repo.

```sh
go run cve-2021-37624/main.go -v -rhost 127.0.0.1
go run cve-2021-37624/main.go -fll DEBUG -v -c -e -rhost 127.0.0.1 -rport 5061 -transport tls -msg ey -user dembele
go run cve-2021-41145/main.go -v -c -e -rhost 127.0.0.1 -fhost rand
```

### Docker

A Docker Compose file is provided, including an Asterisk server to test against.

```sh
task docker # Or `docker compose up -d`
```

## References

- https://github.com/vulncheck-oss/go-exploit/tree/main/docs
- https://github.com/emiago/sipgo
- https://datatracker.ietf.org/doc/html/rfc3261
- https://datatracker.ietf.org/doc/html/rfc3311
- https://datatracker.ietf.org/doc/html/rfc3581
- https://datatracker.ietf.org/doc/html/rfc3265
- https://datatracker.ietf.org/doc/html/rfc7118
