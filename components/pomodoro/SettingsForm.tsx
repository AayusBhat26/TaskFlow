"use client";

import {
  pomodoroSettingsSchema,
  PomodoroSettingsSchema,
} from "@/schema/pomodoroSettingsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PomodoroSettings, PomodoroSoundEffect } from "@prisma/client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Clock, Play, Volume2 } from "lucide-react";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { LoadingState } from "../ui/loadingState";
import { useCallback, useMemo, useState } from "react";
import { pathsToSoundEffects } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Howl } from "howler";

interface Props {
  pomodoroSettings: PomodoroSettings;
}

export const SettingsForm = ({
  pomodoroSettings: {
    id,
    longBreakDuration,
    longBreakInterval,
    rounds,
    shortBreakDuration,
    workDuration,
    soundEffect,
    soundEffectVolume,
  },
}: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const form = useForm<PomodoroSettingsSchema>({
    resolver: zodResolver(pomodoroSettingsSchema),
    defaultValues: {
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      longBreakInterval,
      rounds,
      soundEffect,
      soundEffectVolume: soundEffectVolume * 100,
    },
  });

  const { toast } = useToast();

  const m = useTranslations("MESSAGES");
  const t = useTranslations("POMODORO.SETTINGS.FORM");
  const router = useRouter();

  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: async (formData: PomodoroSettingsSchema) => {
      await axios.post(`/api/pomodoro/update`, formData);
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS_DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      toast({
        title: m("SUCCES.UPDATE_POMODORO_SETTINGS"),
      });
      router.refresh();
    },
    mutationKey: ["updatePomodoroSettings"],
  });

  const { mutate: resetSettings, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/pomodoro/update`, {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 2,
        rounds: 3,
        soundEffect: PomodoroSoundEffect.BELL,
        soundEffectVolume: 50,
      });
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS_DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      toast({
        title: m("SUCCES.RESET_POMODORO_SETTINGS"),
      });

      form.reset({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 2,
        rounds: 3,
        soundEffect: PomodoroSoundEffect.BELL,
        soundEffectVolume: 50,
      });
      router.refresh();
    },
    mutationKey: ["resetPomodoroSettings"],
  });

  const isDefaultValue = useMemo(() => {
    return (
      workDuration === 25 &&
      shortBreakDuration === 5 &&
      longBreakDuration === 15 &&
      longBreakInterval === 2 &&
      rounds === 3 &&
      soundEffect === PomodoroSoundEffect.BELL &&
      soundEffectVolume === 0.5
    );
  }, [
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    rounds,
    soundEffect,
    soundEffectVolume,
  ]);

  const playSoundEffectHandler = useCallback(
    (soundEffect: PomodoroSoundEffect) => {
      const currentPath = pathsToSoundEffects[soundEffect];

      const sound = new Howl({
        src: currentPath,
        html5: true,
        onend: () => {
          setIsPlaying(false);
        },
        volume: form.getValues("soundEffectVolume") / 100,
      });

      sound.play();

      setIsPlaying(true);
    },
    [form]
  );

  const onSubmit = (data: PomodoroSettingsSchema) => {
    updateSettings(data);
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6 w-full">
          <div className="flex gap-2 items-center text-muted-foreground">
            <Clock />
            <p>{t("TIMER")}</p>
          </div>
          <FormField
            control={form.control}
            name="workDuration"
            render={({ field: { value, onChange } }) => (
              <FormItem className="space-y-1.5">
                <FormLabel>{t("WORK.LABEL", { value })}</FormLabel>
                <FormControl>
                  <Slider
                    min={15}
                    max={60}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>{t("WORK.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shortBreakDuration"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t("SHORT_BREAK.LABEL", { value })}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={15}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>{t("SHORT_BREAK.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longBreakDuration"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t("LONG_BREAK.LABEL", { value })}</FormLabel>
                <FormControl>
                  <Slider
                    min={10}
                    max={45}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>{t("LONG_BREAK.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rounds"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t("ROUNDS.LABEL", { value })}</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>{t("ROUNDS.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longBreakInterval"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>
                  {t("LONG_BREAKS_INTERVAL.LABEL", { value })}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={2}
                    max={10}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>
                  {t("LONG_BREAKS_INTERVAL.DESC")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 items-center text-muted-foreground">
            <Volume2 />
            <p>{t("SOUND")}</p>
          </div>

          <FormField
            control={form.control}
            name="soundEffect"
            render={({ field }) => (
              <FormItem className="sm:max-w-sm">
                <FormLabel>{t("ALARM.LABEL")}</FormLabel>
                <div className="flex gap-2 items-center">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PomodoroSoundEffect.ANALOG}>
                        {t("ALARM.ANALOG")}
                      </SelectItem>
                      <SelectItem value={PomodoroSoundEffect.BELL}>
                        {t("ALARM.BELL")}
                      </SelectItem>
                      <SelectItem value={PomodoroSoundEffect.BIRD}>
                        {t("ALARM.BIRD")}
                      </SelectItem>
                      <SelectItem value={PomodoroSoundEffect.CHURCH_BELL}>
                        {t("ALARM.CHURCH_BELL")}
                      </SelectItem>
                      <SelectItem value={PomodoroSoundEffect.DIGITAL}>
                        {t("ALARM.DIGITAL")}
                      </SelectItem>
                      <SelectItem value={PomodoroSoundEffect.FANCY}>
                        {t("ALARM.FANCY")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={isPlaying}
                    onClick={() => {
                      playSoundEffectHandler(
                        field.value as PomodoroSoundEffect
                      );
                    }}
                    type="button"
                    variant={"ghost"}
                    size={"icon"}
                  >
                    <Play />
                  </Button>
                </div>
                <FormDescription>{t("ALARM.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soundEffectVolume"
            render={({ field: { value, onChange } }) => (
              <FormItem className="sm:max-w-sm">
                <FormLabel> {t("VOLUME.LABEL", { value })}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={[value]}
                    onValueChange={(vals) => {
                      onChange(vals[0]);
                    }}
                    value={[value]}
                  />
                </FormControl>
                <FormDescription>{t("VOLUME.DESC")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-4">
          <Button
            disabled={isUpdating || isDefaultValue}
            type="button"
            onClick={() => {
              resetSettings();
            }}
            className="w-full sm:w-auto"
          >
            {isResetting ? (
              <LoadingState loadingText={t("RESET.BTN_PENDING")} />
            ) : (
              t("RESET.BTN")
            )}
          </Button>
          <Button
            disabled={isResetting}
            className="text-white w-full sm:w-auto"
            type="submit"
          >
            {isUpdating ? (
              <LoadingState loadingText={t("SAVE.BTN_PENDING")} />
            ) : (
              t("SAVE.BTN")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
