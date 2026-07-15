import { Console, fetch, Storage } from "@nsnanocat/util";
import database from "../function/database.mjs";
import setENV from "../function/setENV.mjs";

export async function FeedResponse($request, $response) {
	const url = new URL($request.url);
	const format = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
	if (!["text/json", "application/json"].includes(format)) return $response;

	const { Settings, Caches } = setENV("BiliBili", "ADBlock", database);
	Console.logLevel = Settings.LogLevel;
	const body = JSON.parse($response.body ?? "{}");

	if (!["app.bilibili.com", "app.biliapi.net"].includes(url.hostname)) return $response;

	switch (url.pathname) {
		case "/x/v2/feed/index":
			await processFeed();
			break;
		case "/x/v2/feed/index/story":
			processStory();
			break;
	}

	$response.body = JSON.stringify(body);
	return $response;

	async function processFeed() {
		if (Settings?.Feed?.AD === false) {
			Console.warn("用户设置推荐页广告不去除");
			return;
		}

		const isLiveCard = item => item?.card_goto === "live" && item?.card_type === "small_cover_v9";
		if (body.data?.items?.length) {
			body.data.items = await Promise.all(body.data.items.map(processItem));
			body.data.items = body.data.items.filter(item => item !== undefined);
		}

		async function processItem(item) {
			const { card_type: cardType, card_goto: cardGoto, goto: gotoType } = item;
			if (!(cardType && cardGoto)) return item;

			if (["banner_v8", "banner_ipad_v8"].includes(cardType) && cardGoto === "banner") {
				if (Settings?.Feed?.Activity) {
					Caches.banner_hash = item.hash;
					Storage.setItem("@BiliBili.ADBlock.Caches", Caches);
					Console.info("✅ 推荐页活动大图去除");
					return undefined;
				}
				if (item.banner_item) {
					item.banner_item = item.banner_item.filter(bannerItem => bannerItem.type !== "ad");
				}
			} else if (["cm_v2", "cm_v1"].includes(cardType) && ["ad_web_s", "ad_av", "ad_web_gif"].includes(cardGoto)) {
				Console.log(`✅ ${cardGoto}广告去除`);
				if (url.searchParams.get("device") !== "phone") return undefined;
				item = await fixPosition();
			} else if (isLiveCard(item)) {
				if (Settings?.Feed?.Live) {
					Console.info("✅ 推荐页直播去除");
					item = await fixPosition();
				} else {
					let blockUpLiveList = Settings?.Feed?.BlockUpLiveList;
					if (typeof blockUpLiveList === "number") blockUpLiveList = blockUpLiveList.toString();
					if (blockUpLiveList?.includes(item?.args?.up_id?.toString())) {
						Console.log(`✅ 屏蔽Up主<${item?.args?.up_name}>直播推广`);
						item = await fixPosition();
					}
				}
			} else if (cardType === "cm_v2" && ["ad_player", "ad_inline_3d", "ad_inline_eggs", "ad_inline_live"].includes(cardGoto)) {
				Console.log(`✅ ${cardGoto}广告去除`);
				return undefined;
			} else if (cardType === "small_cover_v10" && cardGoto === "game") {
				Console.info("✅ 游戏广告去除");
				if (url.searchParams.get("device") !== "phone") return undefined;
				item = await fixPosition();
			} else if (cardType === "cm_double_v9" && cardGoto === "ad_inline_av") {
				Console.info("✅ 大视频广告去除");
				return undefined;
			} else if (gotoType === "vertical_av" && Settings?.Feed?.Vertical) {
				Console.info("✅ 竖屏视频去除");
				item = await fixPosition();
			}

			return item;
		}

		async function fixPosition() {
			let itemsCache = Storage.getItem("@BiliBili.Index.Caches", []);
			if (Settings?.Feed?.Live) itemsCache = itemsCache.filter(item => !isLiveCard(item));
			let singleItem = {};

			if (itemsCache.length === 0) {
				const request = { url: $request.url, headers: $request.headers };
				await fetch(request).then(response => {
					try {
						const refillBody = JSON.parse(response.body || "{}");
						if (refillBody?.code === 0 && refillBody?.message === "0" && refillBody.data?.items) {
							const refillItems = refillBody.data.items.filter(item => {
								const { card_type: cardType, card_goto: cardGoto, goto: gotoType } = item;
								if (!(cardType && cardGoto)) return true;
								if (cardType === "banner_v8" && cardGoto === "banner") return false;
								if (cardType === "cm_v2" && ["ad_web_s", "ad_av", "ad_web_gif", "ad_player", "ad_inline_3d", "ad_inline_eggs", "ad_inline_live"].includes(cardGoto)) return false;
								if (cardType === "small_cover_v10" && cardGoto === "game") return false;
								if (Settings?.Feed?.Live && isLiveCard(item)) return false;
								if (cardType === "cm_double_v9" && cardGoto === "ad_inline_av") return false;
								if (cardType === "large_cover_v9" && cardGoto === "inline_av_v2") return false;
								return gotoType !== "vertical_av";
							});
							Storage.setItem("@BiliBili.Index.Caches", refillItems);
							Console.info("✅ 推荐页缓存数组补充成功");
						}
					} catch (error) {
						Console.error(error, response);
					}
				});
				itemsCache = Storage.getItem("@BiliBili.Index.Caches", []);
			}

			if (itemsCache.length > 0) {
				singleItem = itemsCache.pop();
				Console.info("✅ 推荐页空缺位填充成功");
			}
			Storage.setItem("@BiliBili.Index.Caches", itemsCache);
			return singleItem;
		}
	}

	function processStory() {
		if (Settings?.Feed?.Story === false) {
			Console.warn("用户设置首页短视频流广告不去除");
			return;
		}
		if (!body.data?.items) return;

		const filterSet = new Set(["vertical_ad_av", "vertical_ad_picture", "vertical_ad_live", "vertical_pgc"]);
		if (Settings?.Feed?.Live) filterSet.add("vertical_live");
		body.data.items = body.data.items.filter(item => !(Object.prototype.hasOwnProperty.call(item, "ad_info") || filterSet.has(item.card_goto)));
		Console.info("✅ 首页短视频流广告去除");
	}
}
