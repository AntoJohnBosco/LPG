import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  adminService,
  alertService,
  deviceService,
  locationService,
  mqttService,
  settingsService,
  summaryService,
  timelineService,
} from "@/services/gasguard-service";
import type { EmergencyContactInput, NotificationPreferences } from "@/types";

export function useDevices() {
  return useQuery({ queryKey: queryKeys.devices, queryFn: deviceService.list });
}

export function useDevice(id: string) {
  return useQuery({ queryKey: queryKeys.device(id), queryFn: () => deviceService.get(id) });
}

export function useDeviceReadings(id: string) {
  return useQuery({
    queryKey: queryKeys.deviceReadings(id),
    queryFn: () => deviceService.readings(id),
  });
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: alertService.list });
}

export function useAlertHistory() {
  return useQuery({ queryKey: queryKeys.alertHistory, queryFn: alertService.history });
}


export function useSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: summaryService.get });
}

export function useNetworkTrend() {
  return useQuery({ queryKey: queryKeys.networkTrend, queryFn: summaryService.trend });
}

export function useMqttStatus() {
  return useQuery({ queryKey: queryKeys.mqtt, queryFn: mqttService.status });
}

export function useTimeline() {
  return useQuery({ queryKey: queryKeys.timeline, queryFn: timelineService.list });
}

export function useEmergencyContacts() {
  return useQuery({ queryKey: queryKeys.contacts, queryFn: settingsService.contacts });
}

export function useSaveContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmergencyContactInput) => settingsService.saveContact(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts }),
  });
}


export function usePreferences() {
  return useQuery({ queryKey: queryKeys.preferences, queryFn: settingsService.preferences });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (next: NotificationPreferences) => settingsService.savePreferences(next),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.preferences, data),
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
  });
}

export function useToggleValve(deviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (closed: boolean) => deviceService.setValve(deviceId, closed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.device(deviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    },
  });
}

export function useLiveLocation() {
  return useQuery({
    queryKey: queryKeys.liveLocation,
    queryFn: locationService.live,
    // Users report GPS every minute — refresh on the same cadence.
    refetchInterval: 60_000,
  });
}

export function useReportLocation() {
  return useMutation({
    mutationFn: (point: { lat: number; lng: number }) => locationService.reportUser(point),
  });
}

export function useRegisteredUsers() {
  return useQuery({ queryKey: queryKeys.adminUsers, queryFn: adminService.users });
}
