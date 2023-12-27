import { TI_API_KEY } from "@env";

export const fetchData = async() => {
    return fetch(
      "https://api.tokeninsight.com/api/v1/coins/list",
      {
        method: "GET",
        headers: {
          "TI_API_KEY": TI_API_KEY,
        },
      }
    );
  };
  
  export const getDetailedCoinDataAPI = async(id) => {
    
    return fetch(
      `https://api.tokeninsight.com/api/v1/coins/${id}`,
      {
        method: "GET",
        headers: {
          "TI_API_KEY": TI_API_KEY,
        },
      }
    );
  };

  export const getCoin365DayPricesAPI = async(id) => {
    
    return fetch(
      
      `https://api.tokeninsight.com/api/v1/history/coins/${id}?interval=day&length=365`,
      {
        method: "GET",
        headers: {
          "TI_API_KEY": TI_API_KEY,
        },
      }
    );
  };
  export const getCoin24HaurPricesAPI = async(id) => {
    
    return fetch(
      
      `https://api.tokeninsight.com/api/v1/history/coins/${id}?interval=hour&length=24`,
      {
        method: "GET",
        headers: {
          "TI_API_KEY": TI_API_KEY,
        },
      }
    );
  };
  
  export const getCoin60MinutePricesAPI = async(id) => {
    
    return fetch(
      
      `https://api.tokeninsight.com/api/v1/history/coins/${id}?interval=minute&length=60`,
      {
        method: "GET",
        headers: {
          "TI_API_KEY": TI_API_KEY,
        },
      }
    );
  };
 
  
  