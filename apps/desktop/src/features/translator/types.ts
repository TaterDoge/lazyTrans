import type { TranslateProvider } from "@/services/translate/types";

/**
 * 单个翻译结果项的状态
 */
export interface TranslateResultItem {
  /** 错误信息 */
  error: string | null;
  /** 是否正在翻译中 */
  loading: boolean;
  /** 翻译服务标识 */
  provider: TranslateProvider;
  /** 翻译结果文本（按行分割） */
  resultLines: string[];
}

/**
 * TranslateResultList 组件的 Props
 */
export interface TranslateResultListProps {
  /** 待翻译的原始文本（每次 Enter 触发时更新） */
  text: string;
}
