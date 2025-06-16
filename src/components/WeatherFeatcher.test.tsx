import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeatherFetcher from './WeatherFetcher';

// Mocking the fetch API
global.fetch = jest.fn();

describe('WeatherFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the input and button', () => {
    render(<WeatherFetcher />);
    expect(screen.getByPlaceholderText(/wpisz nazwę miasta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pobierz pogodę/i })).toBeInTheDocument();
  });

  it('shows error if input is empty', async () => {
    render(<WeatherFetcher />);
    fireEvent.click(screen.getByRole('button', { name: /pobierz pogodę/i }));
    expect(await screen.findByText(/wpisz nazwę miasta/i)).toBeInTheDocument();
  });

  it('shows error if city is not found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });
    render(<WeatherFetcher />);
    fireEvent.change(screen.getByPlaceholderText(/wpisz nazwę miasta/i), { target: { value: 'NieistniejąceMiasto' } });
    fireEvent.click(screen.getByRole('button', { name: /pobierz pogodę/i }));
    expect(await screen.findByText(/nie znaleziono miasta/i)).toBeInTheDocument();
  });

  it('shows temperature after successful fetch', async () => {
    // Mock successful city geocoding
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ name: 'Kraków', latitude: 50.0614, longitude: 19.9366 }],
        }),
      })
      // Mock successful weather fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current_weather: { temperature: 25 },
        }),
      });
    render(<WeatherFetcher />);
    fireEvent.change(screen.getByPlaceholderText(/wpisz nazwę miasta/i), { target: { value: 'Kraków' } });
    fireEvent.click(screen.getByRole('button', { name: /pobierz pogodę/i }));

    expect(await screen.findByText(/aktualna temperatura w/i)).toBeInTheDocument();
    expect(screen.getByText(/25°C/)).toBeInTheDocument();
  });

  it('shows error if weather API fails', async () => {
    // Mock successful geocoding
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ name: 'Warszawa', latitude: 52.2297, longitude: 21.0122 }],
        }),
      })
      // Mock failed weather fetch
      .mockResolvedValueOnce({
        ok: false,
      });

    render(<WeatherFetcher />);
    fireEvent.change(screen.getByPlaceholderText(/wpisz nazwę miasta/i), { target: { value: 'Warszawa' } });
    fireEvent.click(screen.getByRole('button', { name: /pobierz pogodę/i }));

    expect(await screen.findByText(/failed to fetch weather data/i)).toBeInTheDocument();
  });
});