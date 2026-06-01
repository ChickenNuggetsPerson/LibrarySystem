'use client'



export function getLastSearchURL() {
    return localStorage.getItem("last-search") ?? "/library"
}

export function setLastSearchURL(lastSearch: string) {
    localStorage.setItem("last-search", lastSearch)
}