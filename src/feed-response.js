import { Console, done } from "@nsnanocat/util";
import { FeedResponse } from "./process/FeedResponse.mjs";

!(async () => {
	$response = await FeedResponse($request, $response);
})()
	.catch(error => Console.error(error))
	.finally(() => done($response));
