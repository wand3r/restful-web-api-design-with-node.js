import levelup, { LevelUp } from "levelup";
import leveldown, {
  LevelDownOptions,
  LevelDownPutOptions,
  LevelDownGetOptions,
  LevelDownDeleteOptions,
  LevelDownIteratorOptions,
  LevelDownBatchOptions,
} from "leveldown";
import encode from "encoding-down";
import { CodecOptions } from "level-codec";

export type DbType<TKey, TValue> = LevelUp<
  TKey,
  TValue,
  LevelDownOptions,
  LevelDownPutOptions & CodecOptions,
  LevelDownGetOptions & CodecOptions,
  LevelDownDeleteOptions & CodecOptions,
  LevelDownIteratorOptions & CodecOptions,
  LevelDownBatchOptions & CodecOptions
>;

export const db: <TKey, TValue>(path: string) => DbType<TKey, TValue> = path =>
  levelup(encode(leveldown(path), { valueEncoding: "json" }));
