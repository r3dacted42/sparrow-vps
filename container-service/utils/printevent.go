package utils

import (
	"fmt"
	"io"
	"sort"
	"strings"
	"time"

	"github.com/docker/docker/api/types/events"
)

const rfc3339NanoFixed = "2006-01-02T15:04:05.000000000Z07:00"

func PrettyPrintEvent(out io.Writer, event events.Message) {
	if event.TimeNano != 0 {
		_, _ = fmt.Fprintf(out, "%s ", time.Unix(0, event.TimeNano).Format(rfc3339NanoFixed))
	} else if event.Time != 0 {
		_, _ = fmt.Fprintf(out, "%s ", time.Unix(event.Time, 0).Format(rfc3339NanoFixed))
	}

	_, _ = fmt.Fprintf(out, "%s %s %s", event.Type, event.Action, event.Actor.ID)

	if len(event.Actor.Attributes) > 0 {
		var attrs []string
		var keys []string
		for k := range event.Actor.Attributes {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			v := event.Actor.Attributes[k]
			attrs = append(attrs, k+"="+v)
		}
		_, _ = fmt.Fprintf(out, " (%s)", strings.Join(attrs, ", "))
	}
	_, _ = fmt.Fprint(out, "\n")
}
