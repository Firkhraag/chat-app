export const generateMessage = (username: string, text: string) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
