import assert from "node:assert/strict";
import test from "node:test";

import {
  generateSignalHuntChallenge,
} from "../../src/brain-boost/signalHuntEngine.ts";

test("Signal Hunt genera señales deterministas y válidas en 99 niveles", () => {
  let tested = 0;

  for (let level = 1; level <= 99; level++) {
    for (const seed of [1, 7, 103, 999]) {
      const challenge = generateSignalHuntChallenge(level, seed);

      assert.deepEqual(
        challenge,
        generateSignalHuntChallenge(level, seed),
      );

      const expectedChannels =
        level <= 10 ? 3 :
        level <= 30 ? 4 :
        level <= 60 ? 5 : 6;

      const expectedPulses =
        level <= 10 ? 3 :
        level <= 30 ? 4 :
        level <= 60 ? 5 : 6;

      assert.equal(challenge.level, level);
      assert.equal(challenge.channelCount, expectedChannels);
      assert.equal(challenge.pulseCount, expectedPulses);
      assert.equal(challenge.channels.length, expectedChannels);
      assert.equal(challenge.targetPulses.length, expectedPulses);

      for (const pulse of challenge.targetPulses) {
        assert.ok(Number.isInteger(pulse) && pulse >= 0 && pulse <= 3);
      }

      const signatures = challenge.channels.map(
        (channel) => channel.pulses.join(""),
      );

      assert.equal(new Set(signatures).size, expectedChannels);

      const matching = challenge.channels.filter(
        (channel) =>
          channel.pulses.join("") === challenge.targetPulses.join(""),
      );

      assert.equal(matching.length, 1);
      assert.equal(matching[0].id, challenge.correctChannelId);

      for (const channel of challenge.channels) {
        assert.equal(channel.pulses.length, expectedPulses);
      }

      tested++;
    }
  }

  assert.equal(tested, 396);
});

test("Signal Hunt normaliza niveles y tolera semillas no finitas", () => {
  assert.equal(generateSignalHuntChallenge(0, 1).level, 1);
  assert.equal(generateSignalHuntChallenge(1000, 1).level, 99);
  assert.equal(generateSignalHuntChallenge(Number.NaN, 1).level, 1);

  assert.deepEqual(
    generateSignalHuntChallenge(12, 42),
    generateSignalHuntChallenge(12, 42),
  );

  assert.deepEqual(
    generateSignalHuntChallenge(12, Number.NaN),
    generateSignalHuntChallenge(12, 1),
  );
});
