import { expect, it } from "vitest";
import { careerAchievements, type CareerStats } from "./profile-achievements";
const empty: CareerStats = { games: 0, goals: 0, assists: 0, saves: 0, tackles: 0, mvps: 0 };
it.each([["debut", "games", 1], ["regular", "games", 5], ["scorer", "goals", 10], ["keeper", "saves", 10], ["mvp", "mvps", 1]] as const)("%s desbloqueia somente no limite %s=%s", (id, metric, target) => {
  expect(careerAchievements({ ...empty, [metric]: target - 1 }).find(a => a.id === id)?.unlocked).toBe(false);
  expect(careerAchievements({ ...empty, [metric]: target }).find(a => a.id === id)?.unlocked).toBe(true);
});