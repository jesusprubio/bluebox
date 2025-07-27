// Package errors includes helpers for creating common error messages.
package errors

import (
	"fmt"
)

// NewRequiredParam returns an error indicating that a required parameter is
// missing.
func NewRequiredParam(param string) string {
	return fmt.Errorf("required parameter: %s", param).Error()
}
