export class MessageDTO {
  public id: string;
  public role: string;
  public text: string;

  public static newFromDB(message: any): MessageDTO {
    const dto = new MessageDTO();
    dto.id = message.id.toString();
    dto.role = message.role;
    dto.text = message.text;
    return dto;
  }
}
