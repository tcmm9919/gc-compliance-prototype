"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeftRight, User } from "lucide-react";
import { motion } from "framer-motion";

import { useMockData } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Block, DetailHeader } from "@/components/ext/block";
import { StatusBadge } from "@/components/ext/status-badge";
import { RiskBadge } from "@/components/ext/risk-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { AssistantPanel } from "@/components/ext/assistant-panel";
import { Money } from "@/components/ext/money-kzt";

const SEVERITY_LABEL = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
} as const;

const SEVERITY_TONE = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "danger",
} as const;

const STATUS_LABEL = {
  new: "Открыто",
  in_progress: "На проверке",
  rejected: "Отклонено",
  escalated: "Эскалировано",
  closed: "Закрыто",
} as const;

const STATUS_TONE = {
  new: "info",
  in_progress: "warning",
  rejected: "danger",
  escalated: "danger",
  closed: "muted",
} as const;

export function AlertDetail({ id }: { id: string }) {
  const data = useMockData();
  const alert = data.alerts.find((a) => a.id === id) ?? data.alerts[0];
  if (!alert) return null;

  const client = data.clients.find((c) => c.id === alert.clientId);
  const tx = alert.transactionId
    ? data.transactions.find((t) => t.id === alert.transactionId)
    : undefined;

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <DetailHeader
        avatar={
          <div className="size-12 rounded-xl bg-risk-high/15 text-risk-high flex items-center justify-center">
            <AlertTriangle className="size-6" />
          </div>
        }
        title={alert.ruleName}
        subtitle={`${alert.id} · сработало ${client?.fullName ?? alert.clientId}`}
        badges={
          <>
            <StatusBadge tone={SEVERITY_TONE[alert.severity]}>
              {SEVERITY_LABEL[alert.severity]}
            </StatusBadge>
            <StatusBadge tone={STATUS_TONE[alert.status]}>
              {STATUS_LABEL[alert.status]}
            </StatusBadge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              Эскалировать
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/cases/new?fromAlert=${alert.id}&client=${alert.clientId}`}>
                В кейс
              </Link>
            </Button>
            <Button size="sm">Закрыть</Button>
            <AssistantPanel
              contextLabel={alert.ruleName}
              contextSubtitle={`${alert.id} · ${SEVERITY_LABEL[alert.severity]}`}
              quickPrompts={[
                "Почему сработало это правило именно сейчас?",
                "Похожие срабатывания за месяц",
                "Подготовь заключение для закрытия",
              ]}
            />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Block title="Триггеры срабатывания" className="lg:col-span-2">
          <div className="rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{alert.ruleName}</span>
              <span className="text-xs text-muted-foreground">
                Сработало <RelativeTime iso={alert.date} />
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Условия выполнились на текущей сессии клиента. Подробный лог условий — на странице правила.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/rules/${alert.ruleId}`}>Открыть правило</Link>
              </Button>
              {alert.scenarioId ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/workflows/${alert.scenarioId}`}>Открыть сценарий</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Block>

        <Block title="Клиент">
          {client ? (
            <div className="space-y-3 text-sm">
              <Link
                href={`/clients/${client.id}`}
                className="block font-medium hover:underline"
              >
                {client.fullName}
              </Link>
              <div className="flex gap-2">
                <RiskBadge level={client.riskLevel} />
                <StatusBadge tone="muted">{client.segment}</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground">
                {client.id} · {client.country} · скор {client.internalScore}
              </p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/clients/${alert.clientId}`}>
                  <User className="size-4" />
                  Открыть карточку
                </Link>
              </Button>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Клиент {alert.clientId}</span>
          )}
        </Block>

        {tx ? (
          <Block title="Связанная транзакция" className="lg:col-span-3">
            <Link
              href={`/transactions/${tx.id}`}
              className="flex items-center justify-between gap-4 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-4 py-3 transition hover:bg-foreground/[0.05] dark:hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <ArrowLeftRight className="size-5" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{tx.id}</span>
                  <span className="font-medium truncate">{tx.counterparty.name}</span>
                </div>
              </div>
              <Money amount={tx.amount} currency={tx.currency} amountKZT={tx.amountKZT} />
            </Link>
          </Block>
        ) : null}

        <Block title="Журнал действий" className="lg:col-span-3">
          <ol className="relative space-y-3 pl-6">
            <div className="pointer-events-none absolute left-2 top-2 bottom-2 w-px bg-foreground/[0.08] dark:bg-white/[0.10]" aria-hidden />
            {[
              { time: "2 ч назад", who: "Жумабеков Е.К.", what: "Создал оповещение" },
              { time: "1 ч назад", who: "Серикбаева А.Н.", what: "Изменила статус на «В работе»" },
              { time: "20 мин назад", who: "Compliance-агент", what: "Сформировал предварительное заключение" },
            ].map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="relative"
              >
                <span
                  className="absolute -left-6 top-1 size-2.5 rounded-full bg-primary ring-4 ring-primary/15"
                  aria-hidden
                />
                <div className="text-sm leading-tight">
                  <span className="font-medium">{r.who}</span>
                  <span className="text-muted-foreground"> — {r.what}</span>
                </div>
                <span className="text-xs text-muted-foreground">{r.time}</span>
              </motion.li>
            ))}
          </ol>
        </Block>
      </div>
    </div>
  );
}
