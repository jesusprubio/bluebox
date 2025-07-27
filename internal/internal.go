// Package internal includes specific implementations of this project.
package internal

import (
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	"github.com/Masterminds/semver"
	sipgo "github.com/emiago/sipgo/sip"
	"github.com/icholy/digest"
	"github.com/jesusprubio/bluebox/internal/errors"
	"github.com/vulncheck-oss/go-exploit/config"
	"github.com/vulncheck-oss/go-exploit/output"
	"github.com/vulncheck-oss/go-exploit/protocol"
	"github.com/vulncheck-oss/go-exploit/protocol/sip"
	"github.com/vulncheck-oss/go-exploit/random"
)

const (
	DefaultHost      = "127.0.0.1"
	DefaultTransport = sip.UDP
	DefaultMethod    = sipgo.OPTIONS
	DefaultUser      = "1000"
	// Print long operation status every X requests.
	PrintReqInterval = 1000
	// TODO: Move to go-exploit.
	ProtocolSIP = "SIP"
	// TODO: Make this configurable.
	connTimeout = 5 * time.Second
)

var DefaultPort = sip.DefaultPorts[DefaultTransport]

// MixedConnect connects to a server using the specified transport type.
//
// Default parameters:
// - host: "127.0.0.1"
// - port: depends on the transport type (UDP: 5060, TCP: 5060, TLS: 5061)
// - transport: UDP
// TODO: Move to go-exploit.
func MixedConnect(
	host string,
	port int,
	transport sip.TransportType,
) (net.Conn, bool) {
	if host == "" {
		host = DefaultHost
	}
	if port == 0 {
		port = sip.DefaultPorts[transport]
	}
	if transport == sip.UNKNOWN {
		transport = sip.UDP
	}
	output.PrintfFrameworkDebug(
		"Connecting to server %s:%d (%s)",
		host,
		port,
		transport,
	)
	var ok bool
	var conn net.Conn
	if transport == sip.UDP {
		conn, ok = protocol.UDPConnect(host, port)
	} else {
		conn, ok = protocol.MixedConnect(host, port, transport == sip.TLS)
	}
	if !ok {
		output.PrintfFrameworkError(
			"Connecting to server %s:%d (%s)",
			host,
			port,
			transport,
		)
		return nil, false
	}
	err := conn.SetDeadline(time.Now().Add(connTimeout))
	if err != nil {
		output.PrintfFrameworkWarn(
			"Setting deadline for connection to %s:%d (%s): %v",
			host,
			port,
			transport,
			err,
		)
	}
	return conn, true
}

// SendAndReceive sends a SIP request and waits for a response.
//
// The default transport type is UDP.
// TODO: Move to go-exploit.
func SendAndReceive(
	conn *net.Conn, req sipgo.Message, transport sip.TransportType,
) (*sipgo.Response, bool) {
	if conn == nil {
		output.PrintFrameworkError(errors.NewRequiredParam("conn"))
		return nil, false
	}
	if req == nil {
		output.PrintFrameworkError(errors.NewRequiredParam("req"))
		return nil, false
	}
	if transport == sip.UNKNOWN {
		transport = sip.UDP
	}
	var resp *sipgo.Response
	var ok bool
	output.PrintfFrameworkDebug("Sending request: %s", req)
	if transport == sip.UDP {
		udpConn, okConn := (*conn).(*net.UDPConn)
		if !okConn {
			output.PrintFrameworkError("Connection is not a UDP connection")
			return nil, false
		}
		resp, ok = sip.SendAndReceiveUDP(udpConn, req)
	} else {
		resp, ok = sip.SendAndReceiveTCP(*conn, req)
	}
	if !ok {
		output.PrintfFrameworkError("Sending request %s", req)
	}
	output.PrintfFrameworkDebug("Got response: %s", resp)
	return resp, ok
}

// Ping returns the response of a SIP request to the specified host and port.
//
// Useful in the 'ValidateTarget' step.
// Default parameters:
// - transport: UDP
// - method: OPTIONS
// TODO: Move to go-exploit.
func Ping(
	conf *config.Config, transport sip.TransportType, method sipgo.RequestMethod,
) (*sipgo.Response, bool) {
	conn, ok := MixedConnect(conf.Rhost, conf.Rport, transport)
	if !ok {
		output.PrintfFrameworkError(
			"Connecting to server %s:%d (%s)", conf.Rhost, conf.Rport, transport,
		)
		return nil, false
	}
	defer conn.Close()
	if transport == sip.UNKNOWN {
		transport = sip.UDP
	}
	if method == "" {
		method = DefaultMethod
	}
	reqOpts := sip.NewSipRequestOpts{
		Port:      conf.Rport,
		LocalPort: conf.Lport,
		LocalHost: conf.Lhost,
		User:      DefaultUser,
		ToUser:    DefaultUser,
		Transport: transport,
	}
	req, ok := sip.NewSipRequest(method, conf.Rhost, &reqOpts)
	if !ok {
		output.PrintfFrameworkError(
			"Creating request to %s with options %+v", conf.Rhost, reqOpts,
		)
		return nil, false
	}
	output.PrintfFrameworkStatus("Ping: %s", req)
	resp, ok := SendAndReceive(&conn, req, transport)
	if ok {
		output.PrintfFrameworkStatus("Pong: %s", resp)
	}
	return resp, ok
}

// PingOpts are the optional parameters for the Ping function.
// TODO: Move to go-exploit.
type PingOpts struct {
	// Default: '127.0.0.1'
	Host string
	// Default: OPTIONS
	Method sipgo.RequestMethod
	// Most of the times the servers answer without users.
	Req *sip.NewSipRequestOpts
}

// ParseTransport converts a string to a sip.TransportType.
// TODO: Move to go-exploit.
func ParseTransport(transport string) sip.TransportType {
	switch strings.ToLower(transport) {
	case "udp":
		return sip.UDP
	case "tcp":
		return sip.TCP
	case "tls":
		return sip.TLS
	default:
		return sip.UNKNOWN
	}
}

// ParseMethod converts a string to a sipgo.RequestMethod.
// TODO: Move to go-exploit.
func ParseMethod(method string) sipgo.RequestMethod {
	switch strings.ToLower(method) {
	case "options":
		return sipgo.OPTIONS
	case "invite":
		return sipgo.INVITE
	case "register":
		return sipgo.REGISTER
	case "ack":
		return sipgo.ACK
	case "bye":
		return sipgo.BYE
	case "cancel":
		return sipgo.CANCEL
	case "subscribe":
		return sipgo.SUBSCRIBE
	case "notify":
		return sipgo.NOTIFY
	case "publish":
		return sipgo.PUBLISH
	case "refer":
		return sipgo.REFER
	case "info":
		return sipgo.INFO
	case "message":
		return sipgo.MESSAGE
	case "prack":
		return sipgo.PRACK
	case "update":
		return sipgo.UPDATE
	default:
		return ""
	}
}

// Fingerprint sends a request to the server. If the response is valid, it tries
// to extract the software product and version from the response headers.
//
// Useful in the 'CheckVersion' step.
// TODO: Move to go-exploit.
func Fingerprint(conf *config.Config, transport sip.TransportType, method sipgo.RequestMethod) (*SoftwareDetails, bool) {
	resp, ok := Ping(conf, transport, method)
	if !ok || resp == nil {
		output.PrintfFrameworkError("Failed pinging over %s (%s)", transport, method)
		return nil, false
	}
	output.PrintfFrameworkDebug("Got response: %s", resp)
	details := &SoftwareDetails{}
	headerServer := resp.GetHeader("server")
	orgHeader := resp.GetHeader("organization")
	userAgentHeader := resp.GetHeader("user-agent")
	clientHeader := resp.GetHeader("client")
	rawValue := ""
	if headerServer != nil {
		rawValue = headerServer.Value()
	} else if userAgentHeader != nil {
		rawValue = userAgentHeader.Value()
	} else if orgHeader != nil {
		rawValue = orgHeader.Value()
	} else if clientHeader != nil {
		rawValue = clientHeader.Value()
	}
	if rawValue == "" {
		return nil, false
	}
	details.Fill(rawValue)
	output.PrintfFrameworkStatus("Details found: %s", details)
	return details, true
}

// SoftwareDetails holds the details of the software running on the server.
// TODO: Move to go-exploit.
type SoftwareDetails struct {
	// Example: "Asterisk PBX 20.7.0"
	Raw string
	// Example: "Asterisk PBX"
	Product string
	// Example: "20.7.0"
	Version *semver.Version
	// Example: 12345
	Stamp int
}

// String returns a string representation of the SoftwareDetails.
func (d *SoftwareDetails) String() string {
	result := fmt.Sprintf("Raw: %s", d.Raw)
	if d.Product != "" {
		result += fmt.Sprintf(", Product: %s", d.Product)
	}
	if d.Version != nil {
		result += fmt.Sprintf(", Version: %s", d.Version)
	}
	if d.Stamp > 0 {
		result += fmt.Sprintf(", Stamp: %d", d.Stamp)
	}
	return result
}

// Fill extracts the product and version from the raw string.
//
// Examples:
// - Asterisk PBX 20.7.0
// - FreeSWITCH-mod_sofia/1.10.11
// - OpenSIPS (3.4.4 (x86_64/linux))
// - Kamailio (6.0.0 (x86_64/linux))
// - sipXecs/22.04 sipXecs (Linux)
// - OpenSBC 2.8.4
// - 3CXPhone 18.0.6.658
// - Zoiper 5.5.12
// - X-Lite release 5.9.5 stamp 114829
// - Bria Enterprise 6.7.1 stamp 118234
// - MicroSIP/3.21.3
// - Jitsi Desktop 2.10.5550
// - eyeBeam release 3.1.4 stamp 47546
// - CounterPath Bria Mobile 7.4.2
// - Avaya IX Workplace 3.8.0
// - Telephone 1.5.3
// - PhonerLite 3.25
// - SJphone/1.65.377 (SJ Labs)
// - SIPML5-2.3.4
// - WebRTC SIP Client 2.1
// - softphone.pro 4.2.1
// - CSipSimple r2500
func (d *SoftwareDetails) Fill(raw string) {
	raw = strings.TrimSpace(raw)
	d.Raw = raw
	parts := strings.FieldsFunc(raw, splitDetails)
	productParts := make([]string, 0, len(parts))
	for i, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		partLower := strings.ToLower(part)
		if partLower == "release" && i+1 < len(parts) {
			parts = append(parts[:i], parts[i+1:]...)
			continue
		}
		if partLower == "stamp" && i+1 < len(parts) {
			stamp, err := strconv.Atoi(parts[i+1])
			if err == nil {
				d.Stamp = stamp
			}
			parts = append(parts[:i], parts[i+2:]...)
			continue
		}
		ver, err := semver.NewVersion(part)
		if err == nil {
			d.Version = ver
			continue
		}
		productParts = append(productParts, strings.TrimSpace(part))
	}
	if len(productParts) > 0 {
		d.Product = strings.Join(productParts, " ")
	}
}

func splitDetails(r rune) bool {
	return r == ' ' || r == '/' || r == '-' || r == '(' || r == ')'
}

// RandomIP generates a random IP address.
func RandomIP(isV6 bool) net.IP {
	if isV6 {
		return random.RandIPv6()
	}
	return random.RandIPv4()
}

// IsIPv6 checks if the connection is using IPv6.
func IsIPv6(conn net.Conn) bool {
	return net.ParseIP(conn.RemoteAddr().String()).To4() == nil
}

// Send sends a SIP request without waiting for a response.
// TODO: Move to go-exploit.
func Send(
	conn net.Conn, req sipgo.Message, transport sip.TransportType,
) bool {
	if conn == nil {
		output.PrintFrameworkError(errors.NewRequiredParam("conn"))
		return false
	}
	if req == nil {
		output.PrintFrameworkError(errors.NewRequiredParam("req"))
		return false
	}
	if transport == sip.UNKNOWN {
		transport = sip.UDP
	}
	output.PrintfFrameworkDebug("Sending request: %s (%s)", req, transport)
	reqBytes := []byte(req.String())
	var ok bool
	if transport == sip.UDP {
		udpConn, okConn := (conn).(*net.UDPConn)
		if !okConn {
			output.PrintError("Connection is not a UDP connection")
			return false
		}
		ok = protocol.UDPWrite(udpConn, reqBytes)
	} else {
		ok = protocol.TCPWrite(conn, reqBytes)
	}
	if !ok {
		output.PrintfError("Writing message %s (%s)", req, transport)
	}
	return ok
}

// ValidateRunExploit checks if the service keeps working like before the flood.
// TODO: Go-exploit should support a similar behavior for exploits tagged like
// DenialOfService.
func ValidateRunExploit(conf *config.Config, transport sip.TransportType, method sipgo.RequestMethod, code int) bool {
	output.PrintFrameworkStatus("Validating the service is still running ...")
	resp, ok := Ping(conf, transport, method)
	// The server is down.
	if !ok {
		return true
	}
	// The server is still up, but the behavior has changed.
	if resp.StatusCode != code {
		return true
	}
	return false
}

// Register authenticates a user in the server.
//
// Returns the authentication header to be added to subsequent requests.
// TODO: Move to go-exploit.
func Register(conn net.Conn, reqOpts *sip.NewSipRequestOpts) (bool, sipgo.Header) {
	if conn == nil {
		output.PrintFrameworkError(errors.NewRequiredParam("conn"))
	}
	host := conn.RemoteAddr().String()
	req, ok := sip.NewSipRequest(sipgo.REGISTER, host, reqOpts)
	if !ok {
		output.PrintFrameworkError("Creating REGISTER with options %+v", reqOpts)
		return false, nil
	}
	resp, ok := SendAndReceive(&conn, req, reqOpts.Transport)
	if !ok {
		output.PrintFrameworkError("Sending REGISTER request %s", req.String())
		return false, nil
	}
	if resp.StatusCode != sipgo.StatusUnauthorized {
		output.PrintfFrameworkError("Unexpected response %d (%s) to REGISTER request", resp.StatusCode, resp.Reason)
		return false, nil
	}
	wwwAuth := resp.GetHeader("WWW-Authenticate")
	chal, err := digest.ParseChallenge(wwwAuth.Value())
	if err != nil {
		output.PrintfFrameworkError("Parsing WWW-Authenticate header: %s", err)
		return false, nil
	}
	creds, _ := digest.Digest(chal, digest.Options{
		Method:   req.Method.String(),
		URI:      host,
		Username: reqOpts.User,
		Password: reqOpts.Password,
	})
	reqAuth := req.Clone()
	authHeader := sipgo.NewHeader("Authorization", creds.String())
	reqAuth.AppendHeader(authHeader)
	cseqHeader := sipgo.CSeqHeader{SeqNo: uint32(2), MethodName: sipgo.REGISTER}
	reqAuth.ReplaceHeader(&cseqHeader)
	resp, ok = SendAndReceive(&conn, reqAuth, reqOpts.Transport)
	if !ok {
		output.PrintfFrameworkError("Sending REGISTER request with Authorization header %s", reqAuth.String())
		return false, nil
	}
	if resp.StatusCode != sipgo.StatusOK {
		output.PrintfFrameworkError("Unexpected response %d (%s) to REGISTER request with Authorization header", resp.StatusCode, resp.Reason)
		return false, nil
	}
	output.PrintfStatus("Registered user %s with password %s", reqOpts.User, reqOpts.Password)
	creds, _ = digest.Digest(chal, digest.Options{
		Method:   req.Method.String(),
		URI:      req.Destination(),
		Username: reqOpts.User,
		Password: reqOpts.Password,
	})
	return true, sipgo.NewHeader("Authorization", creds.String())
}
