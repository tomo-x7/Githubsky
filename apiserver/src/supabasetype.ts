export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			deleted: {
				Row: {
					bsky_handle: string | null;
					bsky_password: string;
					created_at: string;
					deleted_at: string;
					DID: string;
					fail_count: number;
					github_name: string;
					Github_token: string | null;
					id: number;
					iv: string;
					old_id: number | null;
				};
				Insert: {
					bsky_handle?: string | null;
					bsky_password: string;
					created_at?: string;
					deleted_at?: string;
					DID: string;
					fail_count?: number;
					github_name: string;
					Github_token?: string | null;
					id?: number;
					iv?: string;
					old_id?: number | null;
				};
				Update: {
					bsky_handle?: string | null;
					bsky_password?: string;
					created_at?: string;
					deleted_at?: string;
					DID?: string;
					fail_count?: number;
					github_name?: string;
					Github_token?: string | null;
					id?: number;
					iv?: string;
					old_id?: number | null;
				};
				Relationships: [];
			};
			deleted_v2: {
				Row: {
					bsky_handle: string | null;
					created_at: string;
					DID: string;
					fail_count: number;
					github_name: string;
					Github_token: string | null;
					id: number;
				};
				Insert: {
					bsky_handle?: string | null;
					created_at?: string;
					DID: string;
					fail_count?: number;
					github_name: string;
					Github_token?: string | null;
					id?: number;
				};
				Update: {
					bsky_handle?: string | null;
					created_at?: string;
					DID?: string;
					fail_count?: number;
					github_name?: string;
					Github_token?: string | null;
					id?: number;
				};
				Relationships: [];
			};
			errorlog: {
				Row: {
					created_at: string;
					errorlog: string | null;
					id: number;
				};
				Insert: {
					created_at?: string;
					errorlog?: string | null;
					id?: number;
				};
				Update: {
					created_at?: string;
					errorlog?: string | null;
					id?: number;
				};
				Relationships: [];
			};
			schedulesky_images: {
				Row: {
					alt: string | null;
					blob: Json;
					created_at: string;
					id: number;
					parent_post: number;
					rid: string;
				};
				Insert: {
					alt?: string | null;
					blob: Json;
					created_at?: string;
					id?: number;
					parent_post: number;
					rid: string;
				};
				Update: {
					alt?: string | null;
					blob?: Json;
					created_at?: string;
					id?: number;
					parent_post?: number;
					rid?: string;
				};
				Relationships: [
					{
						foreignKeyName: "schedulesky_images_parent_post_fkey";
						columns: ["parent_post"];
						isOneToOne: false;
						referencedRelation: "schedulesky_posts";
						referencedColumns: ["id"];
					},
				];
			};
			schedulesky_posts: {
				Row: {
					created_at: string;
					did: string;
					facet: Json | null;
					id: number;
					post_at: string;
					text: string | null;
				};
				Insert: {
					created_at?: string;
					did: string;
					facet?: Json | null;
					id?: number;
					post_at: string;
					text?: string | null;
				};
				Update: {
					created_at?: string;
					did?: string;
					facet?: Json | null;
					id?: number;
					post_at?: string;
					text?: string | null;
				};
				Relationships: [];
			};
			test: {
				Row: {
					bsky_handle: string | null;
					created_at: string;
					DID: string;
					fail_count: number;
					github_name: string;
					Github_token: string | null;
				};
				Insert: {
					bsky_handle?: string | null;
					created_at?: string;
					DID: string;
					fail_count?: number;
					github_name: string;
					Github_token?: string | null;
				};
				Update: {
					bsky_handle?: string | null;
					created_at?: string;
					DID?: string;
					fail_count?: number;
					github_name?: string;
					Github_token?: string | null;
				};
				Relationships: [];
			};
			userdata: {
				Row: {
					bsky_handle: string | null;
					bsky_password: string;
					created_at: string;
					DID: string;
					fail_count: number;
					github_name: string;
					Github_token: string | null;
					id: number;
					iv: string;
					PDS: string | null;
				};
				Insert: {
					bsky_handle?: string | null;
					bsky_password: string;
					created_at?: string;
					DID: string;
					fail_count?: number;
					github_name: string;
					Github_token?: string | null;
					id?: number;
					iv?: string;
					PDS?: string | null;
				};
				Update: {
					bsky_handle?: string | null;
					bsky_password?: string;
					created_at?: string;
					DID?: string;
					fail_count?: number;
					github_name?: string;
					Github_token?: string | null;
					id?: number;
					iv?: string;
					PDS?: string | null;
				};
				Relationships: [];
			};
			userdata_v2: {
				Row: {
					bsky_handle: string | null;
					created_at: string;
					DID: string;
					fail_count: number;
					github_name: string;
					Github_token: string | null;
				};
				Insert: {
					bsky_handle?: string | null;
					created_at?: string;
					DID: string;
					fail_count?: number;
					github_name: string;
					Github_token?: string | null;
				};
				Update: {
					bsky_handle?: string | null;
					created_at?: string;
					DID?: string;
					fail_count?: number;
					github_name?: string;
					Github_token?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			createpost: {
				Args: {
					post_at: string;
					posttext: string;
					facet: Json;
					did: string;
					blob: Json[];
					rid: string[];
					alt: string[];
				};
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;
