// Hand-written DB types. Regenerate with `supabase gen types typescript` once linked.
export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          icon: string | null;
          kind: "income" | "expense" | "transfer";
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["categories"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      financial_links: {
        Row: {
          id: string;
          user_id: string;
          belvo_link_id: string;
          institution: string;
          institution_display_name: string | null;
          status: string;
          access_mode: string | null;
          last_sync_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["financial_links"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["financial_links"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          link_id: string | null;
          category_id: string | null;
          belvo_transaction_id: string | null;
          account_id: string | null;
          account_name: string | null;
          description: string | null;
          merchant: string | null;
          amount: number;
          currency: string;
          type: "inflow" | "outflow";
          status: string;
          occurred_at: string;
          posted_at: string | null;
          raw: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["transactions"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
