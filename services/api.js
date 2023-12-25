export const fetchData = async() => {
    return fetch(
      "https://api.tokeninsight.com/api/v1/coins/list",
      {
        method: "GET",
        headers: {
          "TI_API_KEY": "3bcda8179bfb430ebc228cf1cb65cf67",
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
          "TI_API_KEY": "3bcda8179bfb430ebc228cf1cb65cf67",
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
          "TI_API_KEY": "3bcda8179bfb430ebc228cf1cb65cf67",
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
          "TI_API_KEY": "3bcda8179bfb430ebc228cf1cb65cf67",
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
          "TI_API_KEY": "3bcda8179bfb430ebc228cf1cb65cf67",
        },
      }
    );
  };
 
  
  