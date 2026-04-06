"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ComponentType, useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { fields } from "./fields";

import type {
  Form as FormType,
  FormFieldBlock,
} from "@payloadcms/plugin-form-builder/types";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import Button from "@/components/ui/button";
import RichText from "@/components/ui/rich-text";
import { postJson } from "@/lib/core/utilities";

const fieldMap = fields as unknown as Record<
  string,
  ComponentType<Record<string, unknown>>
>;

export default function FormBlockClient({
  enableIntro,
  form,
  introContent,
  submitUrl,
  submitData,
  refreshOnSubmit,
}: {
  id?: string;
  blockName?: string;
  blockType?: "formBlock";
  enableIntro: boolean;
  form: FormType;
  introContent?: DefaultTypedEditorState;
  submitUrl?: string;
  submitData?: Record<string, unknown>;
  refreshOnSubmit?: boolean;
}) {
  const formMethods = useForm({
    defaultValues: form.fields,
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods;

  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<
    { message: string; status?: string } | undefined
  >();

  const router = useRouter();
  const t = useTranslations("form");

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      const submitForm = async () => {
        setError(undefined);
        setIsLoading(true);

        try {
          if (submitUrl) {
            await postJson(submitUrl, {
              ...submitData,
              ...data,
            });
          } else {
            await postJson("form-submissions", {
              form: form.id,
              submissionData: Object.entries(data).map(([field, value]) => ({
                field,
                value,
              })),
            });
          }

          setIsLoading(false);
          setHasSubmitted(true);

          if (form.confirmationType === "redirect" && form.redirect?.url) {
            router.push(form.redirect.url);
          } else if (refreshOnSubmit) {
            setTimeout(() => {
              router.refresh();
            }, 900);
          }
        } catch (err) {
          console.warn(err);
          setIsLoading(false);
          setError({
            message: err instanceof Error ? err.message : t("submitError"),
          });
        }
      };

      void submitForm();
    },
    [form, router, t, submitUrl, submitData, refreshOnSubmit],
  );

  return (
    <div className="mx-auto max-w-lg">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-2" data={introContent} enableGutter={false} />
      )}

      <div className="rounded-[0.8rem] border border-border p-4 lg:p-6">
        <FormProvider {...formMethods}>
          {!hasSubmitted && (
            <form id={String(form.id)} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 last:mb-0">
                {form.fields?.map((field, index) => {
                  const Field = fieldMap[field.blockType];
                  if (!Field) return null;

                  return (
                    <div className="mb-6 last:mb-0" key={index}>
                      <Field
                        form={form}
                        {...field}
                        {...formMethods}
                        control={control}
                        errors={errors}
                        register={register}
                      />
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="mb-4">{`${error.status || "500"}: ${error.message || ""}`}</div>
              )}

              <Button
                form={String(form.id)}
                eventName={form.title}
                type="submit"
                variant="default"
                disabled={isLoading}
                className="min-w-[9rem]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  <span>{form.submitButtonLabel}</span>
                </span>
              </Button>
            </form>
          )}

          {!isLoading &&
            hasSubmitted &&
            form.confirmationType === "message" && (
              <RichText data={form.confirmationMessage} />
            )}
        </FormProvider>
      </div>
    </div>
  );
}
