import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getApplicationFormOptions } from "@/features/applications/options";

export async function HomeApplyCta() {
  const options = await getApplicationFormOptions();

  return (
    <section className="section-space">
      <div className="container-page">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-powder)_70%,white),color-mix(in_srgb,var(--brand-turquoise)_18%,white))] px-6 py-10 sm:px-10">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Готовы присоединиться?
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Короткая заявка: мы свяжемся с вами, чтобы уточнить детали и
            подобрать встречу.
          </p>
          <div className="mt-8 max-w-xl rounded-[var(--radius-card)] border border-border/70 bg-background/90 p-5 backdrop-blur-sm">
            <ApplicationForm
              options={options}
              variant="compact"
              source="home"
              prefill={{ type: "general" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
