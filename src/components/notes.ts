import Helpers from "./helpers.ts";

type UpdateParams = {
  playerId: number;
  noteId: string;
  note: string;
  shared: boolean;
  append?: boolean;
};

export class Notes {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async delete(playerId: number, noteId: string): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/players/${playerId}/relationships/notes/${noteId}`,
    });
  }

  // TODO: find proper type
  async list(
    player_id: number,
    filter_personal: boolean = false
  ): Promise<object> {
    const data: { [key: string]: string } = {
      include: "user,organization",
      "page[size]": "100",
    };

    if (filter_personal) {
      data["filter[personal]"] = String(filter_personal);
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/players/${player_id}/relationships/notes`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async update({
    playerId: playerId,
    noteId: noteId,
    note,
    shared,
    append = false,
  }: UpdateParams): Promise<object> {
    const url = `/players/${playerId}/relationships/notes/${noteId}`;

    if (append) {
      const existingNote = (await this.info(playerId, noteId)) as {
        data: { attributes: { note: string } };
      };
      if (existingNote) {
        note = `${existingNote.data.attributes.note}\n${note}`;
      }
    }

    const data: {
      data: {
        type: string;
        id: string;
        attributes: { note: string; shared: boolean };
      };
    } = {
      data: {
        type: "playerNote",
        id: "example",
        attributes: {
          note: note,
          shared: shared,
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "PATCH",
      path: url,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async info(playerId: number, noteId: string): Promise<object> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/players/${playerId}/relationships/notes/${noteId}`,
    });
  }
}
