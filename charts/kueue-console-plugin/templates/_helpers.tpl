{{/*
Expand the name of the chart.
*/}}
{{- define "kueue-console-plugin.name" -}}
{{- default .Chart.Name .Values.plugin.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "kueue-console-plugin.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kueue-console-plugin.labels" -}}
helm.sh/chart: {{ include "kueue-console-plugin.chart" . }}
{{ include "kueue-console-plugin.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kueue-console-plugin.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kueue-console-plugin.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include "kueue-console-plugin.name" . }}
{{- end }}

{{/*
ServiceAccount name
*/}}
{{- define "kueue-console-plugin.serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.name }}
{{- .Values.plugin.serviceAccount.name }}
{{- else }}
{{- include "kueue-console-plugin.name" . }}
{{- end }}
{{- end }}

{{/*
Certificate secret name
*/}}
{{- define "kueue-console-plugin.certificateSecretName" -}}
{{- if .Values.plugin.certificateSecretName }}
{{- .Values.plugin.certificateSecretName }}
{{- else }}
{{- printf "%s-cert" (include "kueue-console-plugin.name" .) }}
{{- end }}
{{- end }}
