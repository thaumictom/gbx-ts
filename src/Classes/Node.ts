export default class Node {
	public chunks?: {
		[key: number]: {
			unknowns: any[];
			version: any;
		} | null;
	} = {};
}
