import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import BattleDisplay from "./BattleDisplay";
import { setupStore } from "../../../redux/store";
import { turnEnqueued } from "../../../redux/turnAnimationSlice";
import { buildRunningGame, buildTurnResult } from "../../../test-utils/gameFixtures";

jest.mock("../../api/stompConnection");

const renderBattleDisplay = (game = buildRunningGame()) => {
  const store = setupStore();
  const view = render(
    <Provider store={store}>
      <BattleDisplay game={game} />
    </Provider>
  );
  return { store, ...view };
};

describe("BattleDisplay", () => {
  it("renders the sky, clouds, terrain and tanks as separate layers", () => {
    renderBattleDisplay();
    ["Sky", "Clouds", "Terrain", "Tanks"].forEach((layerName) => {
      expect(screen.getByRole("img", { name: layerName })).toBeInTheDocument();
    });
  });

  it("draws the sky gradient and the terrain", () => {
    renderBattleDisplay();
    const skyContext = (screen.getByRole("img", { name: "Sky" }) as HTMLCanvasElement).getContext("2d")!;
    expect(skyContext.createLinearGradient).toHaveBeenCalled();
    expect(skyContext.fillRect).toHaveBeenCalledWith(0, 0, 1400, 600);
    const terrainContext = (screen.getByRole("img", { name: "Terrain" }) as HTMLCanvasElement).getContext("2d")!;
    expect(terrainContext.stroke).toHaveBeenCalled();
    expect(terrainContext.fill).toHaveBeenCalled();
  });

  it("draws one body per positioned tank", () => {
    renderBattleDisplay();
    const tankContext = (screen.getByRole("img", { name: "Tanks" }) as HTMLCanvasElement).getContext("2d")!;
    expect(tankContext.fillRect).toHaveBeenCalledTimes(2);
  });

  it("shows no projectile or explosion layer when no turn is being replayed", () => {
    renderBattleDisplay();
    expect(screen.queryByRole("img", { name: "Projectile" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Explosion" })).not.toBeInTheDocument();
  });

  it("shows the winner popup for a finished match", () => {
    renderBattleDisplay(buildRunningGame({ gameStatus: "FINISHED", winnerIndex: 1 }));
    expect(screen.getByRole("heading", { name: "Grace wins!" })).toBeInTheDocument();
  });

  it("replays a resolved turn through its layers and then applies the server's game", async () => {
    const { store } = renderBattleDisplay();
    const resultingGame = buildRunningGame({ turnNumber: 1 });

    act(() => {
      store.dispatch(turnEnqueued({ turnResult: buildTurnResult(), resultingGame }));
    });
    expect(screen.getByRole("img", { name: "Projectile" })).toBeInTheDocument();
    expect(store.getState().turnAnimation.gameToApply).toBeNull();

    await waitFor(() => expect(screen.getByRole("img", { name: "Explosion" })).toBeInTheDocument());
    await waitFor(() => expect(store.getState().turnAnimation.phase).toBe("FALLING"));
    await waitFor(() => expect(store.getState().turnAnimation.phase).toBe("IDLE"));

    expect(screen.queryByRole("img", { name: "Projectile" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Explosion" })).not.toBeInTheDocument();
    // The thunk consumed the game and wrote it to the match cache.
    expect(store.getState().turnAnimation.gameToApply).toBeNull();
  });
});
